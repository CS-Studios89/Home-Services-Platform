using HomeServicesPlatform.Data;
using HomeServicesPlatform.Filters;
using HomeServicesPlatform.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace HomeServicesPlatform.Controllers
{
    [ApiController]
    [Route("api/v1/admin")]
    public class AdminController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public AdminController(ApplicationDbContext context)
        {
            _context = context;
        }

        [HttpGet("users")]
        [ServiceFilter(typeof(AuthFilter))]
        public async Task<IActionResult> ListUsers([FromQuery] string? role, [FromQuery] string? status, [FromQuery] string? q, [FromQuery] int limit = 50, [FromQuery] int offset = 0)
        {
            var userId = (int)HttpContext.Items["UserId"]!;
            var user = await _context.users.FindAsync(userId);
            if (user?.Role != "admin") return Forbid();

            limit = Math.Min(Math.Max(limit, 1), 200);
            offset = Math.Max(offset, 0);

            var query = _context.users.AsQueryable();
            if (!string.IsNullOrEmpty(role)) query = query.Where(u => u.Role == role);
            if (!string.IsNullOrEmpty(status)) query = query.Where(u => u.Status == status);
            if (!string.IsNullOrEmpty(q)) query = query.Where(u => u.Email.Contains(q) || u.Name!.Contains(q));

            var items = await query.OrderByDescending(u => u.Id).Skip(offset).Take(limit).Select(u => new { u.Id, u.Email, u.Name, u.Role, u.Status, u.CreatedAt }).ToListAsync();
            return Ok(new { items, limit, offset });
        }

        [HttpPatch("users/{userId}")]
        [ServiceFilter(typeof(AuthFilter))]
        public async Task<IActionResult> UpdateUserStatus(int userId, [FromBody] UpdateUserStatusRequest request)
        {
            var adminUserId = (int)HttpContext.Items["UserId"]!;
            var admin = await _context.users.FindAsync(adminUserId);
            if (admin?.Role != "admin") return StatusCode(403, new { error = "Forbidden" });

            if (request.Status != "active" && request.Status != "disabled") return BadRequest(new { error = "Invalid status" });

            await using var transaction = await _context.Database.BeginTransactionAsync();
            try
            {
                var user = await _context.users.FindAsync(userId);
                if (user == null) return NotFound(new { error = "User not found" });

                user.Status = request.Status;
                if (request.Status == "disabled") await _context.sessions.Where(s => s.user_id == userId).ExecuteDeleteAsync();
                await _context.SaveChangesAsync();

                _context.admin_audit.Add(new AdminAudit { admin_user_id = adminUserId, action = "user.status.update", entity_type = "user", entity_id = userId, meta = System.Text.Json.JsonSerializer.Serialize(new { status = request.Status }) });
                await _context.SaveChangesAsync();
                await transaction.CommitAsync();

                return Ok(new { user.Id, user.Email, user.Name, user.Role, user.Status, user.CreatedAt });
            }
            catch { await transaction.RollbackAsync(); throw; }
        }

        [HttpGet("providers")]
        [ServiceFilter(typeof(AuthFilter))]
        public async Task<IActionResult> ListProviders([FromQuery] string? approved, [FromQuery] int limit = 50, [FromQuery] int offset = 0)
        {
            var adminUserId = (int)HttpContext.Items["UserId"]!;
            var admin = await _context.users.FindAsync(adminUserId);
            if (admin?.Role != "admin") return StatusCode(403, new { error = "Forbidden" });

            limit = Math.Min(Math.Max(limit, 1), 200);
            offset = Math.Max(offset, 0);

            var query = _context.providers.Include(p => p.User).AsQueryable();
            if (!string.IsNullOrEmpty(approved)) query = query.Where(p => p.approved == approved);

            var items = await query.OrderByDescending(p => p.id).Skip(offset).Take(limit).Select(p => new { p.id, p.user_id, p.approved, p.bio, p.rating_avg, p.rating_count, p.User.Email, p.User.Name, p.User.Status, p.User.CreatedAt }).ToListAsync();
            return Ok(new { items, limit, offset });
        }

        [HttpPatch("providers/{providerId}")]
        [ServiceFilter(typeof(AuthFilter))]
        public async Task<IActionResult> SetProviderApproval(int providerId, [FromBody] SetProviderApprovalRequest request)
        {
            var adminUserId = (int)HttpContext.Items["UserId"]!;
            var admin = await _context.users.FindAsync(adminUserId);
            if (admin?.Role != "admin") return StatusCode(403, new { error = "Forbidden" });

            if (request.Approved != "pending" && request.Approved != "approved" && request.Approved != "rejected") return BadRequest(new { error = "Invalid approved value" });

            var provider = await _context.providers.FindAsync(providerId);
            if (provider == null) return NotFound(new { error = "Provider not found" });

            provider.approved = request.Approved;
            await _context.SaveChangesAsync();

            _context.admin_audit.Add(new AdminAudit { admin_user_id = adminUserId, action = "provider.approval.update", entity_type = "provider", entity_id = providerId, meta = System.Text.Json.JsonSerializer.Serialize(new { approved = request.Approved }) });
            await _context.SaveChangesAsync();

            return Ok(new { provider.id, provider.user_id, provider.approved, provider.bio, provider.rating_avg, provider.rating_count });
        }

        [HttpPatch("providers/{providerId}/disable")]
        [ServiceFilter(typeof(AuthFilter))]
        public async Task<IActionResult> DisableProvider(int providerId, [FromBody] DisableProviderRequest? request)
        {
            var adminUserId = (int)HttpContext.Items["UserId"]!;
            var admin = await _context.users.FindAsync(adminUserId);
            if (admin?.Role != "admin") return StatusCode(403, new { error = "Forbidden" });

            await using var transaction = await _context.Database.BeginTransactionAsync();
            try
            {
                var provider = await _context.providers.Include(p => p.User).FirstOrDefaultAsync(p => p.id == providerId);
                if (provider == null) return NotFound(new { error = "Provider not found" });
                if (provider.User.Role != "provider") return BadRequest(new { error = "User is not a provider" });

                provider.User.Status = "disabled";
                provider.approved = "rejected";
                await _context.sessions.Where(s => s.user_id == provider.user_id).ExecuteDeleteAsync();
                await _context.SaveChangesAsync();

                _context.admin_audit.Add(new AdminAudit { admin_user_id = adminUserId, action = "provider.disable", entity_type = "provider", entity_id = providerId, meta = System.Text.Json.JsonSerializer.Serialize(new { user_id = provider.user_id, reason = request?.Reason }) });
                await _context.SaveChangesAsync();
                await transaction.CommitAsync();

                return Ok(new { provider = new { provider.id, provider.user_id, provider.approved }, user = new { provider.User.Id, provider.User.Status } });
            }
            catch { await transaction.RollbackAsync(); throw; }
        }

        [HttpGet("services")]
        [ServiceFilter(typeof(AuthFilter))]
        public async Task<IActionResult> ListServices([FromQuery] int limit = 50, [FromQuery] int offset = 0)
        {
            var adminUserId = (int)HttpContext.Items["UserId"]!;
            var admin = await _context.users.FindAsync(adminUserId);
            if (admin?.Role != "admin") return StatusCode(403, new { error = "Forbidden" });

            limit = Math.Min(Math.Max(limit, 1), 200);
            offset = Math.Max(offset, 0);

            var items = await _context.services.GroupJoin(_context.offerings, s => s.id, o => o.service_id, (s, o) => new { s, o }).SelectMany(x => x.o.DefaultIfEmpty(), (s, o) => new { s.s, o }).GroupBy(x => x.s.id).Select(g => new { g.First().s.id, g.First().s.name, offering_count = g.Count() }).OrderBy(x => x.name).Skip(offset).Take(limit).ToListAsync();
            return Ok(new { items, limit, offset });
        }

        [HttpPost("services")]
        [ServiceFilter(typeof(AuthFilter))]
        public async Task<IActionResult> CreateService([FromBody] CreateServiceRequest request)
        {
            var adminUserId = (int)HttpContext.Items["UserId"]!;
            var admin = await _context.users.FindAsync(adminUserId);
            if (admin?.Role != "admin") return StatusCode(403, new { error = "Forbidden" });

            if (string.IsNullOrEmpty(request.Name)) return BadRequest(new { error = "name is required" });

            var service = new Service { name = request.Name.Trim() };
            _context.services.Add(service);
            await _context.SaveChangesAsync();

            _context.admin_audit.Add(new AdminAudit { admin_user_id = adminUserId, action = "service.create", entity_type = "service", entity_id = service.id, meta = System.Text.Json.JsonSerializer.Serialize(new { name = service.name }) });
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(ListServices), new { service.id, service.name });
        }

        [HttpPatch("services/{serviceId}")]
        [ServiceFilter(typeof(AuthFilter))]
        public async Task<IActionResult> UpdateService(int serviceId, [FromBody] UpdateServiceRequest request)
        {
            var adminUserId = (int)HttpContext.Items["UserId"]!;
            var admin = await _context.users.FindAsync(adminUserId);
            if (admin?.Role != "admin") return StatusCode(403, new { error = "Forbidden" });

            if (string.IsNullOrEmpty(request.Name)) return BadRequest(new { error = "name is required" });

            var service = await _context.services.FindAsync(serviceId);
            if (service == null) return NotFound(new { error = "Service not found" });

            service.name = request.Name.Trim();
            await _context.SaveChangesAsync();

            _context.admin_audit.Add(new AdminAudit { admin_user_id = adminUserId, action = "service.update", entity_type = "service", entity_id = serviceId, meta = System.Text.Json.JsonSerializer.Serialize(new { name = service.name }) });
            await _context.SaveChangesAsync();

            return Ok(new { service.id, service.name });
        }

        [HttpDelete("services/{serviceId}")]
        [ServiceFilter(typeof(AuthFilter))]
        public async Task<IActionResult> DeleteService(int serviceId)
        {
            var adminUserId = (int)HttpContext.Items["UserId"]!;
            var admin = await _context.users.FindAsync(adminUserId);
            if (admin?.Role != "admin") return StatusCode(403, new { error = "Forbidden" });

            var service = await _context.services.FindAsync(serviceId);
            if (service == null) return NotFound(new { error = "Service not found" });

            _context.services.Remove(service);
            await _context.SaveChangesAsync();

            _context.admin_audit.Add(new AdminAudit { admin_user_id = adminUserId, action = "service.delete", entity_type = "service", entity_id = serviceId });
            await _context.SaveChangesAsync();

            return NoContent();
        }

        [HttpGet("audit")]
        [ServiceFilter(typeof(AuthFilter))]
        public async Task<IActionResult> ListAudit([FromQuery] int limit = 50, [FromQuery] int offset = 0)
        {
            var adminUserId = (int)HttpContext.Items["UserId"]!;
            var admin = await _context.users.FindAsync(adminUserId);
            if (admin?.Role != "admin") return StatusCode(403, new { error = "Forbidden" });

            limit = Math.Min(Math.Max(limit, 1), 200);
            offset = Math.Max(offset, 0);

            var items = await _context.admin_audit.Include(a => a.AdminUser).OrderByDescending(a => a.id).Skip(offset).Take(limit).Select(a => new { a.id, a.admin_user_id, admin_email = a.AdminUser.Email, a.action, a.entity_type, a.entity_id, a.meta, a.created_at }).ToListAsync();
            return Ok(new { items, limit, offset });
        }
    }

    public class UpdateUserStatusRequest { public string Status { get; set; } = string.Empty; }
    public class SetProviderApprovalRequest { public string Approved { get; set; } = string.Empty; }
    public class DisableProviderRequest { public string? Reason { get; set; } }
    public class CreateServiceRequest { public string Name { get; set; } = string.Empty; }
    public class UpdateServiceRequest { public string Name { get; set; } = string.Empty; }
}
