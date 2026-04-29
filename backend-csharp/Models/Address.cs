using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace HomeServicesPlatform.Models
{
    public class Address
    {
        [Key]
        public int Id { get; set; }

        [Required]
        [MaxLength(100)]
        public string Country { get; set; } = string.Empty;

        [Required]
        [MaxLength(100)]
        public string City { get; set; } = string.Empty;

        [Required]
        [MaxLength(100)]
        public string Street { get; set; } = string.Empty;

        [MaxLength(100)]
        public string? Building { get; set; }

        public int? Floor { get; set; }

        [MaxLength(100)]
        public string? Apartment { get; set; }

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        // Navigation properties
        public virtual ICollection<User> Users { get; set; } = new List<User>();
        public virtual ICollection<Provider> Providers { get; set; } = new List<Provider>();
        public virtual ICollection<Booking> Bookings { get; set; } = new List<Booking>();
    }
}
