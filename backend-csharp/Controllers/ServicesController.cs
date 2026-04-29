using HomeServicesPlatform.Data;
using HomeServicesPlatform.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace HomeServicesPlatform.Controllers
{
    [ApiController]
    [Route("api/v1/services")]
    public class ServicesController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public ServicesController(ApplicationDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        public async Task<IActionResult> GetServices()
        {
            var services = await _context.services
                .Join(_context.offerings,
                    s => s.id,
                    o => o.service_id,
                    (s, o) => new { s, o })
                .GroupBy(x => x.s.id)
                .Select(g => new
                {
                    service_id = g.First().s.id,
                    name = g.First().s.name,
                    minRate = g.Min(x => x.o.rate)
                })
                .ToListAsync();

            return Ok(services);
        }
    }
}
