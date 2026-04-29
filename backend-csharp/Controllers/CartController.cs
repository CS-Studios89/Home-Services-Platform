using HomeServicesPlatform.Data;
using HomeServicesPlatform.Filters;
using HomeServicesPlatform.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace HomeServicesPlatform.Controllers
{
    [ApiController]
    [Route("api/v1/cart")]
    public class CartController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public CartController(ApplicationDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        [ServiceFilter(typeof(AuthFilter))]
        public async Task<IActionResult> GetCartItems()
        {
            var userId = (int)HttpContext.Items["UserId"]!;
            var cartItems = await _context.cart_items
                .Include(ci => ci.Cart)
                .Include(ci => ci.Offering).ThenInclude(o => o.Service)
                .Include(ci => ci.Offering).ThenInclude(o => o.Provider).ThenInclude(p => p.User)
                .Where(ci => ci.Cart.UserId == userId && ci.Cart.Status == "active")
                .Select(ci => new { ci.Id, ci.StartAt, ci.EndAt, ci.Hours, ci.Offering.Title, ci.Offering.Rate, ci.Offering.Curr, ServiceName = ci.Offering.Service.Name, ProviderName = ci.Offering.Provider.User.Name })
                .ToListAsync();

            if (cartItems.Count == 0)
            {
                var cart = await _context.carts.FirstOrDefaultAsync(c => c.UserId == userId && c.Status == "active");
                if (cart == null)
                {
                    _context.carts.Add(new Cart { UserId = userId, Status = "active" });
                    await _context.SaveChangesAsync();
                }
            }
            return Ok(cartItems);
        }

        [HttpPost]
        [ServiceFilter(typeof(AuthFilter))]
        public async Task<IActionResult> AddCartItem([FromBody] AddCartItemRequest request)
        {
            var userId = (int)HttpContext.Items["UserId"]!;
            if (request.CartItem?.OfferingId == 0 || request.CartItem?.StartAt == null || request.CartItem?.EndAt == null)
                return BadRequest(new { message = "Please fill all required fields" });

            await using var transaction = await _context.Database.BeginTransactionAsync();
            try
            {
                var cart = await _context.carts.FirstOrDefaultAsync(c => c.UserId == userId && c.Status == "active");
                if (cart == null)
                {
                    cart = new Cart { UserId = userId, Status = "active" };
                    _context.carts.Add(cart);
                    await _context.SaveChangesAsync();
                }

                var offering = await _context.offerings.Include(o => o.Provider).FirstOrDefaultAsync(o => o.Id == request.CartItem.OfferingId);
                if (offering == null) return BadRequest(new { message = "Offering not found" });

                var busyTimes = await _context.time_slots.Where(t => t.ProviderId == offering.ProviderId).ToListAsync();
                if (busyTimes.Any(bt => Overlaps(request.CartItem.StartAt.Value, request.CartItem.EndAt.Value, bt.StartAt, bt.EndAt)))
                {
                    await transaction.RollbackAsync();
                    return BadRequest(new { message = "Provider is busy during the selected time" });
                }

                var hours = CalculateHours(request.CartItem.StartAt.Value, request.CartItem.EndAt.Value);
                _context.cart_items.Add(new CartItem { cart_id = cart.id, offering_id = request.CartItem.OfferingId, start_at = request.CartItem.StartAt.Value, end_at = request.CartItem.EndAt.Value, Hours = hours });
                await _context.SaveChangesAsync();
                await transaction.CommitAsync();
                return Ok(new { success = true });
            }
            catch { await transaction.RollbackAsync(); throw; }
        }

        [HttpPatch("{cartItemId}")]
        [ServiceFilter(typeof(AuthFilter))]
        public async Task<IActionResult> EditCartItem(int cartItemId, [FromBody] EditCartItemRequest request)
        {
            var userId = (int)HttpContext.Items["UserId"]!;
            var cartItem = await _context.cart_items.Include(ci => ci.Cart).Include(ci => ci.Offering).ThenInclude(o => o.Provider).FirstOrDefaultAsync(ci => ci.id == cartItemId);
            if (cartItem == null || cartItem.Cart.UserId != userId) return Unauthorized(new { message = "You are not the owner of this item" });

            var busyTimes = await _context.time_slots.Where(t => t.ProviderId == cartItem.Offering.ProviderId).ToListAsync();
            if (busyTimes.Any(bt => Overlaps(request.CartItem.StartAt.Value, request.CartItem.EndAt.Value, bt.StartAt, bt.EndAt)))
                return BadRequest(new { message = "Provider is busy during the selected time" });

            cartItem.start_at = request.CartItem.StartAt.Value;
            cartItem.end_at = request.CartItem.EndAt.Value;
            cartItem.Hours = CalculateHours(request.CartItem.StartAt.Value, request.CartItem.EndAt.Value);
            await _context.SaveChangesAsync();
            return Ok(new { success = true });
        }

        [HttpDelete("{cartItemId}")]
        [ServiceFilter(typeof(AuthFilter))]
        public async Task<IActionResult> DeleteCartItem(int cartItemId)
        {
            var userId = (int)HttpContext.Items["UserId"]!;
            var cartItem = await _context.cart_items.Include(ci => ci.Cart).FirstOrDefaultAsync(ci => ci.id == cartItemId);
            if (cartItem == null || cartItem.Cart.UserId != userId) return Unauthorized(new { message = "You are not the owner of this item" });

            _context.cart_items.Remove(cartItem);
            await _context.SaveChangesAsync();
            return Ok(new { success = true });
        }

        [HttpPost("checkout")]
        [ServiceFilter(typeof(AuthFilter))]
        public async Task<IActionResult> CartCheckout()
        {
            var userId = (int)HttpContext.Items["UserId"]!;
            var cartItems = await _context.cart_items.Include(ci => ci.Cart).Include(ci => ci.Offering).Where(ci => ci.Cart.UserId == userId && ci.Cart.Status == "active").ToListAsync();
            
            await using var transaction = await _context.Database.BeginTransactionAsync();
            try
            {
                var order = new Order { UserId = userId, Status = "pending_payment", Total = cartItems.Sum(ci => ci.Hours * ci.Offering.Rate), Curr = "USD" };
                _context.orders.Add(order);
                await _context.SaveChangesAsync();

                foreach (var ci in cartItems)
                {
                    _context.order_items.Add(new OrderItem { OrderId = order.Id, OfferingId = ci.OfferingId, StartAt = ci.StartAt, EndAt = ci.EndAt, Hours = ci.Hours, Price = ci.Offering.Rate, Total = ci.Hours * ci.Offering.Rate });
                }

                var cart = await _context.carts.FirstOrDefaultAsync(c => c.UserId == userId && c.Status == "active");
                if (cart != null) cart.Status = "checked_out";
                _context.carts.Add(new Cart { UserId = userId, Status = "active" });
                await _context.SaveChangesAsync();
                await transaction.CommitAsync();
                return Ok(new { success = true });
            }
            catch { await transaction.RollbackAsync(); throw; }
        }

        private decimal CalculateHours(DateTime start, DateTime end) => (decimal)Math.Ceiling((end - start).TotalHours);
        private bool Overlaps(DateTime start1, DateTime end1, DateTime start2, DateTime end2) => start1 < end2 && end1 > start2;
    }

    public class AddCartItemRequest { public CartItemDto? CartItem { get; set; } }
    public class EditCartItemRequest { public CartItemDto? CartItem { get; set; } }
    public class CartItemDto { public int OfferingId { get; set; } public DateTime? StartAt { get; set; } public DateTime? EndAt { get; set; } }
}
