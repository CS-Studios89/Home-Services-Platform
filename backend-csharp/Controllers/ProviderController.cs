using HomeServicesPlatform.Data;
using HomeServicesPlatform.Filters;
using HomeServicesPlatform.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace HomeServicesPlatform.Controllers
{
    [ApiController]
    [Route("api/v1/provider")]
    public class ProviderController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public ProviderController(ApplicationDbContext context)
        {
            _context = context;
        }

        [HttpGet("{providerId}")]
        public async Task<IActionResult> GetProviderDetails(int providerId)
        {
            if (providerId < 0)
            {
                return BadRequest(new { message = "id not provided" });
            }

            var provider = await _context.Providers
                .Include(p => p.User)
                .Include(p => p.User.Address)
                .Where(p => p.Id == providerId)
                .Select(p => new
                {
                    p.Id,
                    Name = p.User.Name,
                    p.Bio,
                    p.RatingAvg,
                    p.RatingCount,
                    p.User.Address.Country,
                    p.User.Address.City,
                    p.User.Address.Street,
                    p.User.Address.Building,
                    p.User.Address.Floor,
                    p.User.Address.Apartment
                })
                .FirstOrDefaultAsync();

            if (provider == null)
            {
                return NotFound(new { message = "Provider not found" });
            }

            return Ok(provider);
        }

        [HttpPost("busy-slots")]
        [ServiceFilter(typeof(AuthFilter))]
        public async Task<IActionResult> CreateBusyTimeSlot([FromBody] CreateTimeSlotRequest request)
        {
            var userId = (int)HttpContext.Items["UserId"]!;

            var provider = await _context.Providers.FirstOrDefaultAsync(p => p.UserId == userId);
            if (provider == null)
            {
                return StatusCode(403, new { message = "You are not a provider" });
            }

            if (!request.StartAt.HasValue || !request.EndAt.HasValue)
            {
                return BadRequest(new { message = "start_at and end_at are required valid dates" });
            }

            if (request.StartAt >= request.EndAt)
            {
                return BadRequest(new { message = "start_at must be before end_at" });
            }

            var overlappingSlot = await _context.TimeSlots
                .AnyAsync(t => t.ProviderId == provider.Id && t.StartAt < request.EndAt && t.EndAt > request.StartAt);

            if (overlappingSlot)
            {
                return Conflict(new { message = "Time slot overlaps with an existing slot" });
            }

            var newSlot = new TimeSlot
            {
                ProviderId = provider.Id,
                StartAt = request.StartAt.Value,
                EndAt = request.EndAt.Value,
                BookingId = null
            };

            _context.TimeSlots.Add(newSlot);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetProviderDetails), new
            {
                success = true,
                slot = new
                {
                    id = newSlot.Id,
                    provider_id = newSlot.ProviderId,
                    start_at = newSlot.StartAt,
                    end_at = newSlot.EndAt,
                    booking_id = newSlot.BookingId
                }
            });
        }

        [HttpDelete("busy-slots/{slotId}")]
        [ServiceFilter(typeof(AuthFilter))]
        public async Task<IActionResult> DeleteBusyTimeSlot(int slotId)
        {
            var userId = (int)HttpContext.Items["UserId"]!;

            var provider = await _context.Providers.FirstOrDefaultAsync(p => p.UserId == userId);
            if (provider == null)
            {
                return StatusCode(403, new { message = "You are not a provider" });
            }

            var slot = await _context.TimeSlots
                .FirstOrDefaultAsync(t => t.Id == slotId && t.ProviderId == provider.Id && t.BookingId == null);

            if (slot == null)
            {
                return NotFound(new { message = "Busy slot not found or cannot be deleted" });
            }

            _context.TimeSlots.Remove(slot);
            await _context.SaveChangesAsync();

            return Ok(new
            {
                success = true,
                deletedSlotId = slot.Id
            });
        }

        [HttpGet("busy-slots")]
        [ServiceFilter(typeof(AuthFilter))]
        public async Task<IActionResult> GetManualBusySlots()
        {
            var userId = (int)HttpContext.Items["UserId"]!;

            var provider = await _context.Providers.FirstOrDefaultAsync(p => p.UserId == userId);
            if (provider == null)
            {
                return StatusCode(403, new { message = "You are not a provider" });
            }

            var slots = await _context.TimeSlots
                .Where(t => t.ProviderId == provider.Id && t.BookingId == null)
                .OrderBy(t => t.StartAt)
                .Select(t => new
                {
                    t.Id,
                    t.ProviderId,
                    t.StartAt,
                    t.EndAt,
                    t.BookingId
                })
                .ToListAsync();

            return Ok(new
            {
                success = true,
                slots
            });
        }
    }

    public class CreateTimeSlotRequest
    {
        public DateTime? StartAt { get; set; }
        public DateTime? EndAt { get; set; }
    }
}
