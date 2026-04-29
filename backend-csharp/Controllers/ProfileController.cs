using HomeServicesPlatform.Data;
using HomeServicesPlatform.Filters;
using HomeServicesPlatform.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace HomeServicesPlatform.Controllers
{
    [ApiController]
    [Route("api/v1/profile")]
    public class ProfileController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public ProfileController(ApplicationDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        [ServiceFilter(typeof(AuthFilter))]
        public async Task<IActionResult> GetProfileInfo()
        {
            var userId = (int)HttpContext.Items["UserId"]!;

            var user = await _context.Users
                .Include(u => u.Address)
                .Where(u => u.Id == userId)
                .Select(u => new
                {
                    u.Id,
                    u.Name,
                    u.Email,
                    u.Role,
                    u.Status,
                    u.Address!.Country,
                    u.Address.City,
                    u.Address.Street,
                    u.Address.Building,
                    u.Address.Floor,
                    u.Address.Apartment
                })
                .FirstOrDefaultAsync();

            if (user == null)
            {
                return NotFound();
            }

            return Ok(user);
        }

        [HttpPut]
        [ServiceFilter(typeof(AuthFilter))]
        public async Task<IActionResult> UpdateProfileInfo([FromBody] UpdateProfileRequest request)
        {
            var userId = (int)HttpContext.Items["UserId"]!;

            if (request.NewInfo == null)
            {
                return BadRequest(new { message = "no info provided" });
            }

            await using var transaction = await _context.Database.BeginTransactionAsync();
            try
            {
                var user = await _context.Users
                    .Include(u => u.Address)
                    .FirstOrDefaultAsync(u => u.Id == userId);

                if (user == null)
                {
                    return NotFound();
                }

                if (!string.IsNullOrEmpty(request.NewInfo.Name))
                {
                    user.Name = request.NewInfo.Name;
                }

                if (user.Address != null)
                {
                    if (!string.IsNullOrEmpty(request.NewInfo.Country))
                    {
                        user.Address.Country = request.NewInfo.Country;
                    }
                    if (!string.IsNullOrEmpty(request.NewInfo.City))
                    {
                        user.Address.City = request.NewInfo.City;
                    }
                    if (!string.IsNullOrEmpty(request.NewInfo.Street))
                    {
                        user.Address.Street = request.NewInfo.Street;
                    }
                    if (!string.IsNullOrEmpty(request.NewInfo.Building))
                    {
                        user.Address.Building = request.NewInfo.Building;
                    }
                    if (request.NewInfo.Floor.HasValue && request.NewInfo.Floor.Value > 0)
                    {
                        user.Address.Floor = request.NewInfo.Floor.Value;
                    }
                    if (!string.IsNullOrEmpty(request.NewInfo.Apartment))
                    {
                        user.Address.Apartment = request.NewInfo.Apartment;
                    }
                }

                await _context.SaveChangesAsync();
                await transaction.CommitAsync();

                return Ok(new { status = "success" });
            }
            catch
            {
                await transaction.RollbackAsync();
                throw;
            }
        }
    }

    public class UpdateProfileRequest
    {
        public ProfileInfo? NewInfo { get; set; }
    }

    public class ProfileInfo
    {
        public string? Name { get; set; }
        public string? Country { get; set; }
        public string? City { get; set; }
        public string? Street { get; set; }
        public string? Building { get; set; }
        public int? Floor { get; set; }
        public string? Apartment { get; set; }
    }
}
