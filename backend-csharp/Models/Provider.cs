using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace HomeServicesPlatform.Models
{
    public class Provider
    {
        [Key]
        public int Id { get; set; }

        [Required]
        public int UserId { get; set; }

        [Required]
        [MaxLength(20)]
        public string Approved { get; set; } = "pending"; // pending, approved, rejected

        [MaxLength(1000)]
        public string? Bio { get; set; }

        [Required]
        public int AddrId { get; set; }

        [Required]
        [Column(TypeName = "decimal(3,2)")]
        public decimal RatingAvg { get; set; } = 0;

        [Required]
        public int RatingCount { get; set; } = 0;

        // Navigation properties
        [ForeignKey("UserId")]
        public virtual User User { get; set; } = null!;

        [ForeignKey("AddrId")]
        public virtual Address Address { get; set; } = null!;

        public virtual ICollection<Offering> Offerings { get; set; } = new List<Offering>();
        public virtual ICollection<TimeSlot> TimeSlots { get; set; } = new List<TimeSlot>();
    }
}
