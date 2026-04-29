using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace HomeServicesPlatform.Models
{
    public class Booking
    {
        [Key]
        public int Id { get; set; }

        [Required]
        public int OrderItemId { get; set; }

        [Required]
        public int UserId { get; set; }

        [Required]
        public int AddrId { get; set; }

        [Required]
        [MaxLength(20)]
        public string Status { get; set; } = "requested"; // requested, confirmed, completed, cancelled

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        // Navigation properties
        [ForeignKey("OrderItemId")]
        public virtual OrderItem OrderItem { get; set; } = null!;

        [ForeignKey("UserId")]
        public virtual User User { get; set; } = null!;

        [ForeignKey("AddrId")]
        public virtual Address Address { get; set; } = null!;

        public virtual ICollection<TimeSlot> TimeSlots { get; set; } = new List<TimeSlot>();
        public virtual Review? Review { get; set; }
    }
}
