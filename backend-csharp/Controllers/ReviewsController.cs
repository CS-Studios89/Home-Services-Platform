using HomeServicesPlatform.Data;
using HomeServicesPlatform.Filters;
using HomeServicesPlatform.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace HomeServicesPlatform.Controllers
{
    [ApiController]
    [Route("api/v1/reviews")]
    public class ReviewsController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public ReviewsController(ApplicationDbContext context)
        {
            _context = context;
        }

        [HttpGet("booking/{bookingId}")]
        public async Task<IActionResult> GetReviewByBookingId(int bookingId)
        {
            var review = await _context.reviews.Where(r => r.BookingId == bookingId).Select(r => new { r.Id, r.BookingId, r.UserId, r.Rating, r.Note, r.CreatedAt }).FirstOrDefaultAsync();
            if (review == null) return NotFound(new { message = "Review not found" });
            return Ok(review);
        }

        [HttpGet("provider/{providerId}")]
        public async Task<IActionResult> ListReviewsForProvider(int providerId)
        {
            var reviews = await _context.reviews
                .Join(_context.bookings, r => r.BookingId, b => b.id, (r, b) => new { r, b })
                .Join(_context.order_items, rb => rb.b.order_item_id, oi => oi.Id, (rb, oi) => new { rb.r, rb.b, oi })
                .Join(_context.offerings, rbo => rbo.oi.OfferingId, o => o.id, (rbo, o) => new { rbo.r, rbo.b, rbo.oi, o })
                .Join(_context.providers, rboo => rboo.o.provider_id, p => p.Id, (rboo, p) => new { rboo.r, rboo.b, rboo.oi, rboo.o, p })
                .Join(_context.users, rboop => rboop.r.UserId, u => u.Id, (rboop, u) => new { rboop.r, rboop.b, rboop.oi, rboop.o, rboop.p, u })
                .Where(x => x.p.Id == providerId)
                .OrderByDescending(x => x.r.CreatedAt)
                .Select(x => new { x.r.Id, x.r.BookingId, x.r.UserId, UserName = x.u.Name, x.r.Rating, x.r.Note, x.r.CreatedAt })
                .ToListAsync();
            return Ok(reviews);
        }

        [HttpGet("offering/{offeringId}")]
        public async Task<IActionResult> ListReviewsForOffering(int offeringId)
        {
            var reviews = await _context.reviews
                .Join(_context.bookings, r => r.BookingId, b => b.id, (r, b) => new { r, b })
                .Join(_context.order_items, rb => rb.b.order_item_id, oi => oi.Id, (rb, oi) => new { rb.r, rb.b, oi })
                .Join(_context.users, rbo => rbo.r.UserId, u => u.Id, (rbo, u) => new { rbo.r, rbo.b, rbo.oi, u })
                .Where(x => x.oi.OfferingId == offeringId)
                .OrderByDescending(x => x.r.CreatedAt)
                .Select(x => new { x.r.Id, x.r.BookingId, x.r.UserId, UserName = x.u.Name, x.r.Rating, x.r.Note, x.r.CreatedAt })
                .ToListAsync();
            return Ok(reviews);
        }

        [HttpPost]
        [ServiceFilter(typeof(AuthFilter))]
        public async Task<IActionResult> CreateReview([FromBody] CreateReviewRequest request)
        {
            var userId = (int)HttpContext.Items["UserId"]!;
            if (request.BookingId == 0 || request.Rating == 0) return BadRequest(new { message = "booking_id and rating are required" });
            if (request.Rating < 1 || request.Rating > 5) return BadRequest(new { message = "rating must be between 1 and 5" });
            if (request.Note != null && request.Note.Length > 1000) return BadRequest(new { message = "note is too long (max 1000 chars)" });

            await using var transaction = await _context.Database.BeginTransactionAsync();
            try
            {
                var booking = await _context.bookings.Include(b => b.OrderItem).ThenInclude(oi => oi.Offering).ThenInclude(o => o.Provider).FirstOrDefaultAsync(b => b.id == request.BookingId);
                if (booking == null) return NotFound(new { message = "Booking not found" });
                if (booking.user_id != userId) return StatusCode(403, new { message = "You can only review your own booking" });

                var existing = await _context.reviews.AnyAsync(r => r.BookingId == request.BookingId);
                if (existing) return Conflict(new { message = "Booking already reviewed" });

                var review = new Review { BookingId = request.BookingId, UserId = userId, Rating = request.Rating, Note = request.Note };
                _context.reviews.Add(review);
                await _context.SaveChangesAsync();

                var provider = booking.OrderItem.Offering.Provider;
                provider.RatingCount++;
                provider.RatingAvg = ((provider.RatingAvg * (provider.RatingCount - 1)) + request.Rating) / provider.RatingCount;
                await _context.SaveChangesAsync();
                await transaction.CommitAsync();
                return CreatedAtAction(nameof(GetReviewByBookingId), new { bookingId = request.BookingId }, review);
            }
            catch { await transaction.RollbackAsync(); throw; }
        }
    }

    public class CreateReviewRequest { public int BookingId { get; set; } public int Rating { get; set; } public string? Note { get; set; } }
}
