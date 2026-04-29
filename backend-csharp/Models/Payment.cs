using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace HomeServicesPlatform.Models
{
    public class Payment
    {
        [Key]
        public int Id { get; set; }

        [Required]
        public int OrderId { get; set; }

        [Required]
        [MaxLength(20)]
        public string Method { get; set; } = string.Empty; // credit_card, paypal, etc.

        [Required]
        [MaxLength(20)]
        public string Type { get; set; } = string.Empty; // payment, refund

        [Required]
        [MaxLength(20)]
        public string Status { get; set; } = string.Empty; // pending, completed, failed

        [Required]
        [Column(TypeName = "decimal(12,2)")]
        public decimal Amount { get; set; }

        [Required]
        [MaxLength(3)]
        public string Curr { get; set; } = string.Empty;

        [MaxLength(255)]
        public string? Ref { get; set; }

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        // Navigation properties
        [ForeignKey("OrderId")]
        public virtual Order Order { get; set; } = null!;
    }
}
