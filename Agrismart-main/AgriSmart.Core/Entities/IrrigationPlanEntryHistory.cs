// Agrismart-main/AgriSmart.Core/Entities/IrrigationPlanEntryHistory.cs
using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace AgriSmart.Core.Entities
{
    [Table("IrrigationPlanEntryHistory")]
    public class IrrigationPlanEntryHistory
    {
        [Key]
        public int Id { get; set; }

        /// <summary>
        /// Reference to the IrrigationPlanEntry that was executed
        /// </summary>
        [Required]
        public int IrrigationPlanEntryId { get; set; }

        /// <summary>
        /// Reference to the IrrigationPlan
        /// </summary>
        [Required]
        public int IrrigationPlanId { get; set; }

        /// <summary>
        /// Reference to the IrrigationMode used
        /// </summary>
        [Required]
        public int IrrigationModeId { get; set; }

        /// <summary>
        /// When the execution was initiated
        /// </summary>
        [Required]
        public DateTime ExecutionStartTime { get; set; }

        /// <summary>
        /// When the execution completed
        /// </summary>
        public DateTime? ExecutionEndTime { get; set; }

        /// <summary>
        /// Planned duration in minutes
        /// </summary>
        [Required]
        public int PlannedDuration { get; set; }

        /// <summary>
        /// Actual duration in minutes (calculated from start/end time)
        /// </summary>
        public int? ActualDuration { get; set; }

        /// <summary>
        /// Status of the execution: Scheduled, InProgress, Completed, Failed, Cancelled
        /// </summary>
        [Required]
        [MaxLength(50)]
        public string ExecutionStatus { get; set; } = "Scheduled";

        /// <summary>
        /// Sequence number if multiple entries were executed together
        /// </summary>
        public int? Sequence { get; set; }

        /// <summary>
        /// Notes or remarks about the execution
        /// </summary>
        [MaxLength(1000)]
        public string? Notes { get; set; }

        /// <summary>
        /// Error message if execution failed
        /// </summary>
        [MaxLength(2000)]
        public string? ErrorMessage { get; set; }

        /// <summary>
        /// Whether the execution was triggered manually or automatically
        /// </summary>
        public bool IsManualExecution { get; set; } = true;

        /// <summary>
        /// Water volume delivered (in liters) if available
        /// </summary>
        [Column(TypeName = "decimal(18,4)")]
        public decimal? WaterVolumeDelivered { get; set; }

        /// <summary>
        /// Flow rate during execution (L/min) if measured
        /// </summary>
        [Column(TypeName = "decimal(18,4)")]
        public decimal? FlowRate { get; set; }

        /// <summary>
        /// Pressure reading during execution (bar) if measured
        /// </summary>
        [Column(TypeName = "decimal(18,4)")]
        public decimal? Pressure { get; set; }

        /// <summary>
        /// Temperature reading during execution (°C) if measured
        /// </summary>
        [Column(TypeName = "decimal(18,2)")]
        public decimal? Temperature { get; set; }

        /// <summary>
        /// Reference to the device/controller that executed the irrigation
        /// </summary>
        [MaxLength(100)]
        public string? DeviceId { get; set; }

        [Required]
        public DateTime DateCreated { get; set; } = DateTime.UtcNow;

        public DateTime? DateUpdated { get; set; }

        [Required]
        public int CreatedBy { get; set; }

        public int? UpdatedBy { get; set; }

        // Navigation properties
        [ForeignKey("IrrigationPlanEntryId")]
        public virtual IrrigationPlanEntry? IrrigationPlanEntry { get; set; }

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