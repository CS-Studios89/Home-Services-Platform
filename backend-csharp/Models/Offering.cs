using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace HomeServicesPlatform.Models
{
    public class Offering
    {
        [Key]
        public int Id { get; set; }

        [Required]
        public int ProviderId { get; set; }

        [Required]
        public int ServiceId { get; set; }

        [MaxLength(150)]
        public string? Title { get; set; }

        [Required]
        [Column(TypeName = "decimal(10,2)")]
        public decimal Rate { get; set; }

        [Required]
        [MaxLength(3)]
        public string Curr { get; set; } = string.Empty;

        [Required]
        public bool Active { get; set; } = true;

        // Navigation properties
        [ForeignKey("ProviderId")]
        public virtual Provider Provider { get; set; } = null!;

        [ForeignKey("ServiceId")]
        public virtual Service Service { get; set; } = null!;

        public virtual ICollection<CartItem> CartItems { get; set; } = new List<CartItem>();
        public virtual ICollection<OrderItem> OrderItems { get; set; } = new List<OrderItem>();
    }
}
