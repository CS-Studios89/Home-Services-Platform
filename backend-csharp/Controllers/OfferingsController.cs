using HomeServicesPlatform.Data;
using HomeServicesPlatform.Filters;
using HomeServicesPlatform.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace HomeServicesPlatform.Controllers
{
    [ApiController]
    [Route("api/v1/offerings")]
    public class OfferingsController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public OfferingsController(ApplicationDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        public async Task<IActionResult> GetOfferings()
        {
            var offers = await _context.offerings
                .Include(o => o.Provider)
                    .ThenInclude(p => p.User)
                .Include(o => o.Provider)
                    .ThenInclude(p => p.Address)
                .Include(o => o.Service)
                .Where(o => o.Active)
                .Select(o => new
                {
                    offerId = o.Id,
                    providerName = o.Provider.User.Name,
                    serviceName = o.Service.Name,
                    providerCountry = o.Provider.Address.Country,
                    providerCity = o.Provider.Address.City,
                    offerTitle = o.Title,
                    hourlyRate = o.Rate,
                    currency = o.Curr
                })
                .ToListAsync();

            return Ok(offers);
        }

        [HttpPost]
        public async Task<IActionResult> GetOfferingsWithFilters([FromBody] FilterRequest filters)
        {
            var query = _context.offerings
                .Include(o => o.Provider)
                    .ThenInclude(p => p.User)
                .Include(o => o.Provider)
                    .ThenInclude(p => p.Address)
                .Include(o => o.Service)
                .Where(o => o.Active && o.Provider.User.Role == "provider");

            if (filters.Job != null && filters.Job.Count > 0)
            {
                var jobs = filters.Job.Select(j => j.ToLower()).ToList();
                query = query.Where(o => jobs.Contains(o.Service.Name.ToLower()));
            }

            if (filters.Rate != null)
            {
                if (filters.Rate.Min.HasValue)
                {
                    query = query.Where(o => o.Rate >= filters.Rate.Min.Value);
                }
                if (filters.Rate.Max.HasValue)
                {
                    query = query.Where(o => o.Rate <= filters.Rate.Max.Value);
                }
            }

            if (!string.IsNullOrEmpty(filters.Country))
            {
                query = query.Where(o => o.Provider.Address.Country.ToLower() == filters.Country.ToLower());
            }

            if (filters.Cities != null && filters.Cities.Count > 0)
            {
                var cities = filters.Cities.Select(c => c.ToLower()).ToList();
                query = query.Where(o => cities.Contains(o.Provider.Address.City.ToLower()));
            }

            var offers = await query.Select(o => new
            {
                offerId = o.Id,
                providerName = o.Provider.User.Name,
                serviceName = o.Service.Name,
                providerCountry = o.Provider.Address.Country,
                providerCity = o.Provider.Address.City,
                offerTitle = o.Title,
                hourlyRate = o.Rate,
                currency = o.Curr
            })
            .ToListAsync();

            return Ok(offers);
        }

        [HttpGet("available-time/{offeringId}")]
        public async Task<IActionResult> GetOfferingAvailableTime(int offeringId)
        {
            var offering = await _context.offerings
                .Include(o => o.Provider)
                .FirstOrDefaultAsync(o => o.Id == offeringId);

            if (offering == null)
            {
                return BadRequest(new { message = "No offering Id provided" });
            }

            var busyTimes = await _context.time_slots
                .Where(t => t.ProviderId == offering.ProviderId)
                .OrderBy(t => t.StartAt)
                .Select(t => new
                {
                    start = t.StartAt.Ticks,
                    end = t.EndAt.Ticks
                })
                .ToListAsync();

            var availableSlots = new List<List<long>>();
            var now = DateTime.UtcNow.Ticks;
            var oneHundredYearsLater = DateTime.UtcNow.AddYears(100).Ticks;

            for (int i = 0; i < busyTimes.Count; i++)
            {
                if (i == 0)
                {
                    if (now < busyTimes[i].start)
                    {
                        availableSlots.Add(new List<long> { now, busyTimes[i].start });
                    }
                }
                else
                {
                    if (now < busyTimes[i - 1].end)
                    {
                        availableSlots.Add(new List<long> { busyTimes[i - 1].end, busyTimes[i].start });
                    }
                    else if (now < busyTimes[i].start)
                    {
                        availableSlots.Add(new List<long> { now, busyTimes[i].start });
                    }
                }
            }

            if (busyTimes.Count > 0 && now < busyTimes[busyTimes.Count - 1].end)
            {
                availableSlots.Add(new List<long> { busyTimes[busyTimes.Count - 1].end, oneHundredYearsLater });
            }
            else
            {
                availableSlots.Add(new List<long> { now, oneHundredYearsLater });
            }

            return Ok(availableSlots);
        }

        [HttpGet("me")]
        [ServiceFilter(typeof(AuthFilter))]
        public async Task<IActionResult> GetProviderOffers()
        {
            var userId = (int)HttpContext.Items["UserId"]!;

            var provider = await _context.providers.FirstOrDefaultAsync(p => p.UserId == userId);
            if (provider == null)
            {
                return Unauthorized(new { message = "You are not a provider" });
            }

            var offers = await _context.offerings
                .Include(o => o.Provider)
                    .ThenInclude(p => p.User)
                .Include(o => o.Provider)
                    .ThenInclude(p => p.Address)
                .Include(o => o.Service)
                .Where(o => o.Provider.UserId == userId)
                .Select(o => new
                {
                    offerId = o.Id,
                    providerName = o.Provider.User.Name,
                    serviceName = o.Service.Name,
                    providerCountry = o.Provider.Address.Country,
                    providerCity = o.Provider.Address.City,
                    offerTitle = o.Title,
                    hourlyRate = o.Rate,
                    currency = o.Curr,
                    active = o.Active
                })
                .ToListAsync();

            return Ok(offers);
        }

        [HttpPost("me")]
        [ServiceFilter(typeof(AuthFilter))]
        public async Task<IActionResult> CreateProviderOffer([FromBody] CreateOfferRequest request)
        {
            var userId = (int)HttpContext.Items["UserId"]!;

            var provider = await _context.providers.FirstOrDefaultAsync(p => p.UserId == userId);
            if (provider == null)
            {
                return Unauthorized(new { message = "You are not a provider" });
            }

            if (request.Offer.ServiceId == 0 || string.IsNullOrEmpty(request.Offer.Title) || 
                request.Offer.Rate == null || string.IsNullOrEmpty(request.Offer.Curr) || 
                request.Offer.Active == null)
            {
                return BadRequest(new { message = "Please fill all required fields" });
            }

            var newOffer = new Offering
            {
                ProviderId = provider.Id,
                ServiceId = request.Offer.ServiceId,
                Title = request.Offer.Title,
                Rate = request.Offer.Rate.Value,
                Curr = request.Offer.Curr,
                Active = request.Offer.Active.Value
            };

            _context.offerings.Add(newOffer);
            await _context.SaveChangesAsync();

            return Ok(new { success = true, offerId = newOffer.Id });
        }

        [HttpPatch("{offeringId}")]
        [ServiceFilter(typeof(AuthFilter))]
        public async Task<IActionResult> EditProviderOffer(int offeringId, [FromBody] UpdateOfferRequest request)
        {
            var userId = (int)HttpContext.Items["UserId"]!;

            var provider = await _context.providers.FirstOrDefaultAsync(p => p.UserId == userId);
            if (provider == null)
            {
                return Unauthorized(new { message = "You are not a provider" });
            }

            var offering = await _context.offerings
                .Include(o => o.Provider)
                .FirstOrDefaultAsync(o => o.Id == offeringId);

            if (offering == null)
            {
                return BadRequest(new { message = "Invalid Offering Id" });
            }

            if (offering.Provider.UserId != userId)
            {
                return Unauthorized(new { message = "You are not the owner of this offering" });
            }

            if (string.IsNullOrEmpty(request.Offer.Title) || request.Offer.Rate == null || 
                string.IsNullOrEmpty(request.Offer.Curr) || request.Offer.Active == null || 
                request.Offer.ServiceId == 0)
            {
                return BadRequest(new { message = "Please fill all required fields" });
            }

            offering.ServiceId = request.Offer.ServiceId;
            offering.Title = request.Offer.Title;
            offering.Rate = request.Offer.Rate.Value;
            offering.Curr = request.Offer.Curr;
            offering.Active = request.Offer.Active.Value;

            await _context.SaveChangesAsync();

            return Ok(new { success = true });
        }

        [HttpDelete("{offeringId}")]
        [ServiceFilter(typeof(AuthFilter))]
        public async Task<IActionResult> DeleteProviderOffer(int offeringId)
        {
            var userId = (int)HttpContext.Items["UserId"]!;

            var provider = await _context.providers.FirstOrDefaultAsync(p => p.UserId == userId);
            if (provider == null)
            {
                return Unauthorized(new { message = "You are not a provider" });
            }

            var offering = await _context.offerings
                .Include(o => o.Provider)
                .FirstOrDefaultAsync(o => o.Id == offeringId);

            if (offering == null)
            {
                return BadRequest(new { message = "Invalid Offering Id" });
            }

            if (offering.Provider.UserId != userId)
            {
                return Unauthorized(new { message = "You are not the owner of this offering" });
            }

            _context.offerings.Remove(offering);
            await _context.SaveChangesAsync();

            return Ok(new { success = true });
        }
    }

    public class FilterRequest
    {
        public List<string>? Job { get; set; }
        public RateFilter? Rate { get; set; }
        public string? Country { get; set; }
        public List<string>? Cities { get; set; }
    }

    public class RateFilter
    {
        public decimal? Min { get; set; }
        public decimal? Max { get; set; }
    }

    public class CreateOfferRequest
    {
        public OfferDto Offer { get; set; } = new();
    }

    public class UpdateOfferRequest
    {
        public OfferDto Offer { get; set; } = new();
    }

    public class OfferDto
    {
        public int ServiceId { get; set; }
        public string Title { get; set; } = string.Empty;
        public decimal? Rate { get; set; }
        public string Curr { get; set; } = string.Empty;
        public bool? Active { get; set; }
    }
}
