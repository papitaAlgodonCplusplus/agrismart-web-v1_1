using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace AgriSmart.Core.Entities
{
    [Table("IrrigationPlanEntry")]
    public class IrrigationPlanEntry
    {
        [Key]
        public int Id { get; set; }

        [Required]
        public int IrrigationPlanId { get; set; }

        [Required]
        public int IrrigationModeId { get; set; }

        [Required]
        public TimeSpan StartTime { get; set; }

        /// <summary>
        /// Duration in minutes
        /// </summary>
        [Required]
        public int Duration { get; set; }

        /// <summary>
        /// Week start (1-52)
        /// </summary>
        public int? WStart { get; set; }

        /// <summary>
        /// Week end (1-52)
        /// </summary>
        public int? WEnd { get; set; }

        /// <summary>
        /// Frequency in days
        /// </summary>
        public int? Frequency { get; set; }

        /// <summary>
        /// Order of execution
        /// </summary>
        [Required]
        public int Sequence { get; set; } = 1;

        public bool Active { get; set; } = true;

        public DateTime DateCreated { get; set; } = DateTime.UtcNow;

        public DateTime? DateUpdated { get; set; }

        [Required]
        public int CreatedBy { get; set; }

        public int? UpdatedBy { get; set; }

        // Navigation properties
        [ForeignKey("IrrigationPlanId")]
        public virtual IrrigationPlan? IrrigationPlan { get; set; }

        [ForeignKey("IrrigationModeId")]
        public virtual IrrigationMode? IrrigationMode { get; set; }

        [ForeignKey("CreatedBy")]
        public virtual User? Creator { get; set; }

        [ForeignKey("UpdatedBy")]
        public virtual User? Updater { get; set; }
    }
}