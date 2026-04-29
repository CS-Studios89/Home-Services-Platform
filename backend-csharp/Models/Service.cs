using System.ComponentModel.DataAnnotations;

namespace HomeServicesPlatform.Models
{
    public class Service
    {
        [Key]
        public int Id { get; set; }

        [Required]
        [MaxLength(120)]
        public string Name { get; set; } = string.Empty;

        // Navigation properties
        public virtual ICollection<Offering> Offerings { get; set; } = new List<Offering>();
    }
}
