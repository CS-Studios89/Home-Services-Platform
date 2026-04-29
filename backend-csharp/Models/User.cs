using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace HomeServicesPlatform.Models
{
    public class User
    {
        [Key]
        public int Id { get; set; }

        [Required]
        [MaxLength(255)]
        public string Email { get; set; } = string.Empty;

        [Required]
        [MaxLength(255)]
        public string Pass { get; set; } = string.Empty; // Hashed password

        [MaxLength(120)]
        public string? Name { get; set; }

        [Required]
        [MaxLength(20)]
        public string Role { get; set; } = string.Empty; // client, provider, admin

        [Required]
        [MaxLength(20)]
        public string Status { get; set; } = "active"; // active, disabled

        public int? AddrId { get; set; }

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        // Navigation properties
        [ForeignKey("AddrId")]
        public virtual Address? Address { get; set; }

        public virtual ICollection<Session> Sessions { get; set; } = new List<Session>();
        public virtual Provider? Provider { get; set; }
        public virtual ICollection<Cart> Carts { get; set; } = new List<Cart>();
        public virtual ICollection<Order> Orders { get; set; } = new List<Order>();
        public virtual ICollection<Booking> Bookings { get; set; } = new List<Booking>();
        public virtual ICollection<Review> Reviews { get; set; } = new List<Review>();
        public virtual ICollection<AdminAudit> AdminAuditsAsAdmin { get; set; } = new List<AdminAudit>();
    }
}
