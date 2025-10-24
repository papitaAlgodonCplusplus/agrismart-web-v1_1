using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace AgriSmart.Core.Entities
{
    [Table("IrrigationPlan")]
    public class IrrigationPlan
    {
        [Key]
        public int Id { get; set; }

        [Required]
        [MaxLength(128)]
        public string Name { get; set; } = string.Empty;

        /// <summary>
        /// Bit mask for days of the week
        /// bit 0 = Monday    -> 1    (2^0)
        /// bit 1 = Tuesday   -> 2    (2^1)
        /// bit 2 = Wednesday -> 4    (2^2)
        /// bit 3 = Thursday  -> 8    (2^3)
        /// bit 4 = Friday    -> 16   (2^4)
        /// bit 5 = Saturday  -> 32   (2^5)
        /// bit 6 = Sunday    -> 64   (2^6)
        /// 
        /// Examples:
        /// - Monday to Friday: 1+2+4+8+16 = 31
        /// - Saturday and Sunday: 32 + 64 = 96
        /// - All days: 127
        /// </summary>
        public int DayMask { get; set; }

        public bool Active { get; set; } = true;

        public DateTime DateCreated { get; set; } = DateTime.UtcNow;

        public DateTime? DateUpdated { get; set; }

        [Required]
        public int CreatedBy { get; set; }

        public int? UpdatedBy { get; set; }

        // Navigation properties
        [ForeignKey("CreatedBy")]
        public virtual User? Creator { get; set; }

        [ForeignKey("UpdatedBy")]
        public virtual User? Updater { get; set; }
    }
}