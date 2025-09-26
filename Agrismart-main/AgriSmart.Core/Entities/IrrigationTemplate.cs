
using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace AgriSmart.Core.Entities
{
    [Table("IrrigationTemplates")]
    public class IrrigationTemplate
    {
        [Key]
        public int Id { get; set; }
        
        [Required]
        [MaxLength(200)]
        public string Name { get; set; } = string.Empty;
        
        [MaxLength(1000)]
        public string Description { get; set; } = string.Empty;
        
        [Required]
        [MaxLength(100)]
        public string Category { get; set; } = string.Empty;
        
        public bool IsPublic { get; set; }
        
        // JSON serialized parameters
        [Column(TypeName = "nvarchar(max)")]
        public string DesignParametersJson { get; set; } = string.Empty;
        
        [Column(TypeName = "nvarchar(max)")]
        public string HydraulicParametersJson { get; set; } = string.Empty;
        
        [Required]
        public DateTime CreatedAt { get; set; }
        
        [Required]
        public int CreatedBy { get; set; }
        
        [Required]
        public bool? Active { get; set; } = true;
        
        // Navigation properties
        [ForeignKey("CreatedBy")]
        public virtual User? Creator { get; set; }
    }
}
