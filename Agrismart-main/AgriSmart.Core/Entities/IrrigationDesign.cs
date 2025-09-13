// Agrismart-main/AgriSmart.Core/Entities/IrrigationDesign.cs
using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace AgriSmart.Core.Entities
{
    [Table("IrrigationDesigns")]
    public class IrrigationDesign
    {
        [Key]
        public int Id { get; set; }
        
        [Required]
        [MaxLength(200)]
        public string Name { get; set; } = string.Empty;
        
        [MaxLength(1000)]
        public string Description { get; set; } = string.Empty;
        
        [Required]
        public int CropProductionId { get; set; }
        
        [Required]
        [MaxLength(50)]
        public string DesignType { get; set; } = "drip";
        
        [Required]
        [MaxLength(50)]
        public string Status { get; set; } = "draft";
        
        [Required]
        [MaxLength(20)]
        public string Version { get; set; } = "1.0";
        
        // JSON serialized design parameters
        [Column(TypeName = "nvarchar(max)")]
        public string DesignParametersJson { get; set; } = string.Empty;
        
        [Column(TypeName = "nvarchar(max)")]
        public string HydraulicParametersJson { get; set; } = string.Empty;
        
        [Column(TypeName = "nvarchar(max)")]
        public string? OptimizationParametersJson { get; set; }
        
        [Column(TypeName = "nvarchar(max)")]
        public string? CalculationResultsJson { get; set; }
        
        [Column(TypeName = "nvarchar(max)")]
        public string TagsJson { get; set; } = "[]";
        
        public bool IsTemplate { get; set; }
        
        [MaxLength(100)]
        public string? TemplateCategory { get; set; }
        
        [Required]
        public DateTime CreatedAt { get; set; }
        
        public DateTime? UpdatedAt { get; set; }
        
        [Required]
        public int CreatedBy { get; set; }
        
        public int? UpdatedBy { get; set; }
        
        [Required]
        public bool Active { get; set; } = true;
        
        // Navigation properties
        [ForeignKey("CropProductionId")]
        public virtual CropProduction? CropProduction { get; set; }
        
        [ForeignKey("CreatedBy")]
        public virtual User? Creator { get; set; }
        
        [ForeignKey("UpdatedBy")]
        public virtual User? Updater { get; set; }
    }
}