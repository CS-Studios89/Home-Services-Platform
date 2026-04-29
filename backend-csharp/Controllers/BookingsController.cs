using HomeServicesPlatform.Data;
using HomeServicesPlatform.Filters;
using HomeServicesPlatform.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace HomeServicesPlatform.Controllers
{
    [ApiController]
    [Route("api/v1/booking")]
    public class BookingsController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public BookingsController(ApplicationDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        [ServiceFilter(typeof(AuthFilter))]
        public async Task<IActionResult> GetBookings()
        {
            var userId = (int)HttpContext.Items["UserId"]!;
            var bookings = await _context.Bookings
                .Include(b => b.OrderItem).ThenInclude(oi => oi.Order)
                .Include(b => b.OrderItem).ThenInclude(oi => oi.Offering).ThenInclude(o => o.Service)
                .Include(b => b.OrderItem).ThenInclude(oi => oi.Offering).ThenInclude(o => o.Provider).ThenInclude(p => p.User)
                .Include(b => b.Address)
                .Where(b => b.UserId == userId)
                .Select(b => new
                {
                    booking_id = b.Id,
                    booking_status = b.Status,
                    b.OrderItem.StartAt,
                    b.OrderItem.EndAt,
                    b.OrderItem.Price,
                    b.OrderItem.Hours,
                    b.OrderItem.Total,
                    b.OrderItem.Order.Curr,
                    b.OrderItem.Offering.Title,
                    service_name = b.OrderItem.Offering.Service.Name,
                    provider_name = b.OrderItem.Offering.Provider.User.Name,
                    b.Address.Country,
                    b.Address.City,
                    b.Address.Street,
                    b.Address.Building,
                    b.Address.Floor,
                    b.Address.Apartment
                })
                .ToListAsync();
            return Ok(bookings);
        }

        [HttpDelete("{bookingId}")]
        [ServiceFilter(typeof(AuthFilter))]
        public async Task<IActionResult> CancelBooking(int bookingId)
        {
            var userId = (int)HttpContext.Items["UserId"]!;
            var booking = await _context.Bookings.Include(b => b.OrderItem).FirstOrDefaultAsync(b => b.Id == bookingId);
            if (booking == null || booking.UserId != userId) return StatusCode(403, new { message = "You are not the owner of this booking" });

            await using var transaction = await _context.Database.BeginTransactionAsync();
            try
            {
                booking.Status = "Cancelled";
                await _context.TimeSlots.Where(t => t.BookingId == bookingId).ExecuteDeleteAsync();
                await _context.SaveChangesAsync();
                await transaction.CommitAsync();
                return Ok(new { success = true });
            }
            catch { await transaction.RollbackAsync(); throw; }
        }

        [HttpGet("requests")]
        [ServiceFilter(typeof(AuthFilter))]
        public async Task<IActionResult> GetBookingRequests()
        {
            var userId = (int)HttpContext.Items["UserId"]!;
            var provider = await _context.Providers.FirstOrDefaultAsync(p => p.UserId == userId);
            if (provider == null) return StatusCode(403, new { message = "You are not a provider" });

            var bookings = await _context.Bookings
                .Include(b => b.OrderItem).ThenInclude(oi => oi.Order)
                .Include(b => b.OrderItem).ThenInclude(oi => oi.Offering).ThenInclude(o => o.Service)
                .Include(b => b.OrderItem).ThenInclude(oi => oi.Offering).ThenInclude(o => o.Provider)
                .Include(b => b.User)
                .Include(b => b.Address)
                .Where(b => b.OrderItem.Offering.ProviderId == provider.Id && b.Status == "requested")
                .Select(b => new
                {
                    booking_id = b.Id,
                    booking_status = b.Status,
                    b.OrderItem.StartAt,
                    b.OrderItem.EndAt,
                    b.OrderItem.Price,
                    b.OrderItem.Hours,
                    b.OrderItem.Total,
                    b.OrderItem.Order.Curr,
                    b.OrderItem.Offering.Title,
                    service_name = b.OrderItem.Offering.Service.Name,
                    client_name = b.User.Name,
                    b.Address.Country,
                    b.Address.City,
                    b.Address.Street,
                    b.Address.Building,
                    b.Address.Floor,
                    b.Address.Apartment
                })
                .ToListAsync();
            return Ok(bookings);
        }

        [HttpPut("{bookingId}/accept")]
        [ServiceFilter(typeof(AuthFilter))]
        public async Task<IActionResult> AcceptBooking(int bookingId)
        {
            var userId = (int)HttpContext.Items["UserId"]!;
            var booking = await _context.Bookings.Include(b => b.OrderItem).ThenInclude(oi => oi.Offering).ThenInclude(o => o.Provider).FirstOrDefaultAsync(b => b.Id == bookingId);
            if (booking == null || booking.OrderItem.Offering.Provider.UserId != userId) return StatusCode(403, new { message = "You are not the Provider for this booking" });

            booking.Status = "accepted";
            await _context.SaveChangesAsync();
            return Ok(new { success = true });
        }

        [HttpPut("{bookingId}/reject")]
        [ServiceFilter(typeof(AuthFilter))]
        public async Task<IActionResult> RejectBooking(int bookingId)
        {
            var userId = (int)HttpContext.Items["UserId"]!;
            var booking = await _context.Bookings.Include(b => b.OrderItem).ThenInclude(oi => oi.Offering).ThenInclude(o => o.Provider).FirstOrDefaultAsync(b => b.Id == bookingId);
            if (booking == null || booking.OrderItem.Offering.Provider.UserId != userId) return StatusCode(403, new { message = "You are not the Provider for this booking" });

            await using var transaction = await _context.Database.BeginTransactionAsync();
            try
            {
                booking.Status = "rejected";
                await _context.TimeSlots.Where(t => t.BookingId == bookingId).ExecuteDeleteAsync();
                await _context.SaveChangesAsync();
                await transaction.CommitAsync();
                return Ok(new { success = true });
            }
            catch { await transaction.RollbackAsync(); throw; }
        }

        [HttpGet("provider")]
        [ServiceFilter(typeof(AuthFilter))]
        public async Task<IActionResult> GetProviderBookings()
        {
            var userId = (int)HttpContext.Items["UserId"]!;
            var provider = await _context.Providers.FirstOrDefaultAsync(p => p.UserId == userId);
            if (provider == null) return StatusCode(403, new { message = "You are not a provider" });

            var bookings = await _context.Bookings
                .Include(b => b.OrderItem).ThenInclude(oi => oi.Order)
                .Include(b => b.OrderItem).ThenInclude(oi => oi.Offering).ThenInclude(o => o.Service)
                .Include(b => b.OrderItem).ThenInclude(oi => oi.Offering).ThenInclude(o => o.Provider)
                .Include(b => b.User)
                .Include(b => b.Address)
                .Where(b => b.OrderItem.Offering.ProviderId == provider.Id)
                .OrderByDescending(b => b.Id)
                .Select(b => new
                {
                    booking_id = b.Id,
                    booking_status = b.Status,
                    b.OrderItem.StartAt,
                    b.OrderItem.EndAt,
                    b.OrderItem.Price,
                    b.OrderItem.Hours,
                    b.OrderItem.Total,
                    b.OrderItem.Order.Curr,
                    b.OrderItem.Offering.Title,
                    service_name = b.OrderItem.Offering.Service.Name,
                    client_name = b.User.Name,
                    b.Address.Country,
                    b.Address.City,
                    b.Address.Street,
                    b.Address.Building,
                    b.Address.Floor,
                    b.Address.Apartment
                })
                .ToListAsync();
            return Ok(bookings);
        }
    }
}
