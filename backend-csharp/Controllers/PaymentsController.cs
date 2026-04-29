using HomeServicesPlatform.Data;
using HomeServicesPlatform.Filters;
using HomeServicesPlatform.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace HomeServicesPlatform.Controllers
{
    [ApiController]
    [Route("api/v1/payments")]
    public class PaymentsController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public PaymentsController(ApplicationDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        [ServiceFilter(typeof(AuthFilter))]
        public async Task<IActionResult> GetPayments()
        {
            var userId = (int)HttpContext.Items["UserId"]!;
            var payments = await _context.payments.Where(p => _context.orders.Any(o => o.Id == p.OrderId && o.UserId == userId)).ToListAsync();
            return Ok(payments);
        }

        [HttpPost]
        [ServiceFilter(typeof(AuthFilter))]
        public async Task<IActionResult> MakePayment([FromBody] MakePaymentRequest request)
        {
            var userId = (int)HttpContext.Items["UserId"]!;
            if (request.Info?.OrderId == 0 || string.IsNullOrEmpty(request.Info.Method) || string.IsNullOrEmpty(request.Info.Type) || request.Info.Amount == 0 || string.IsNullOrEmpty(request.Info.Curr))
                return BadRequest(new { message = "Fill all required fields" });

            var order = await _context.orders.FirstOrDefaultAsync(o => o.Id == request.Info.OrderId);
            if (order == null || order.UserId != userId) return BadRequest(new { message = "You are not the owner of this order" });

            var orderItems = await _context.order_items.Include(oi => oi.Offering).ThenInclude(o => o.Provider).Where(oi => oi.OrderId == request.Info.OrderId).ToListAsync();
            await using var transaction = await _context.Database.BeginTransactionAsync();
            try
            {
                foreach (var item in orderItems)
                {
                    var busyTimes = await _context.time_slots.Where(t => t.ProviderId == item.Offering.ProviderId).ToListAsync();
                    if (busyTimes.Any(bt => Overlaps(item.StartAt, item.EndAt, bt.StartAt, bt.EndAt)))
                        return BadRequest(new { message = "Provider is busy during the selected time" });
                }

                if (request.Info.Type == "full" && request.Info.Amount < order.Total)
                    return BadRequest(new { message = "Insufficient Amount" });

                _context.payments.Add(new Payment { OrderId = request.Info.OrderId, Method = request.Info.Method, Type = request.Info.Type, Status = "ok", Amount = request.Info.Amount, Curr = request.Info.Curr });
                order.Status = "paid";
                await _context.SaveChangesAsync();

                var user = await _context.users.Include(u => u.Address).FirstOrDefaultAsync(u => u.Id == userId);
                foreach (var item in orderItems)
                {
                    var booking = new Booking { OrderItemId = item.Id, user_id = userId, addr_id = user!.AddrId ?? 0, status = "requested" };
                    _context.bookings.Add(booking);
                    await _context.SaveChangesAsync();
                    _context.time_slots.Add(new TimeSlot { ProviderId = item.Offering.ProviderId, BookingId = booking.id, StartAt = item.StartAt, EndAt = item.EndAt });
                }
                await _context.SaveChangesAsync();
                await transaction.CommitAsync();
                return Ok(new { success = true });
            }
            catch { await transaction.RollbackAsync(); throw; }
        }

        private bool Overlaps(DateTime start1, DateTime end1, DateTime start2, DateTime end2) => start1 < end2 && end1 > start2;
    }

    public class MakePaymentRequest { public PaymentInfo? Info { get; set; } }
    public class PaymentInfo { public int OrderId { get; set; } public string Method { get; set; } = string.Empty; public string Type { get; set; } = string.Empty; public decimal Amount { get; set; } public string Curr { get; set; } = string.Empty; }
}
