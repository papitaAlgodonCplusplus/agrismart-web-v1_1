// AgriSmart.Core/Entities/Fertilizer.cs
using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace AgriSmart.Core.Entities
{
    [Table("Fertilizer")]
    public class Fertilizer : BaseEntity
    {
        // Existing properties
        [Required]
        public int CatalogId { get; set; }
        
        [Required]
        [StringLength(200)]
        public string Name { get; set; }
        
        [StringLength(200)]
        public string? Manufacturer { get; set; }
        
        public bool IsLiquid { get; set; }
        
        public bool? Active { get; set; }

        // NEW PROPERTIES ADDED

        // Basic Information
        [StringLength(200)]
        public string? Brand { get; set; }
        
        [StringLength(1000)]
        public string? Description { get; set; }
        
        [StringLength(100)]
        public string? Type { get; set; }
        
        [StringLength(200)]
        public string? Formulation { get; set; }
        
        [Column(TypeName = "decimal(18,4)")]
        public decimal? Concentration { get; set; }
        
        [StringLength(50)]
        public string? ConcentrationUnit { get; set; }
        
        [StringLength(100)]
        public string? ApplicationMethod { get; set; }

        // NPK and Nutrient Percentages
        [Column(TypeName = "decimal(18,4)")]
        [Range(0, 100, ErrorMessage = "Nitrogen percentage must be between 0 and 100")]
        public decimal? NitrogenPercentage { get; set; }
        
        [Column(TypeName = "decimal(18,4)")]
        [Range(0, 100, ErrorMessage = "Phosphorus percentage must be between 0 and 100")]
        public decimal? PhosphorusPercentage { get; set; }
        
        [Column(TypeName = "decimal(18,4)")]
        [Range(0, 100, ErrorMessage = "Potassium percentage must be between 0 and 100")]
        public decimal? PotassiumPercentage { get; set; }
        
        [StringLength(500)]
        public string? Micronutrients { get; set; }

        // Stock Management
        [Column(TypeName = "decimal(18,4)")]
        [Range(0, double.MaxValue, ErrorMessage = "Current stock cannot be negative")]
        public decimal? CurrentStock { get; set; }
        
        [Column(TypeName = "decimal(18,4)")]
        [Range(0, double.MaxValue, ErrorMessage = "Minimum stock cannot be negative")]
        public decimal? MinimumStock { get; set; }
        
        [StringLength(50)]
        public string? StockUnit { get; set; }
        
        [Column(TypeName = "decimal(18,6)")]
        [Range(0, double.MaxValue, ErrorMessage = "Price per unit cannot be negative")]
        public decimal? PricePerUnit { get; set; }
        
        [StringLength(200)]
        public string? Supplier { get; set; }

        // Storage and Application
        public DateTime? ExpirationDate { get; set; }
        
        [StringLength(1000)]
        public string? StorageInstructions { get; set; }
        
        [StringLength(1000)]
        public string? ApplicationInstructions { get; set; }

        // Chemical Analysis Parameters
        [Column(TypeName = "decimal(18,6)")]
        public decimal? Ca { get; set; } // Calcium
        
        [Column(TypeName = "decimal(18,6)")]
        public decimal? K { get; set; } // Potassium
        
        [Column(TypeName = "decimal(18,6)")]
        public decimal? Mg { get; set; } // Magnesium
        
        [Column(TypeName = "decimal(18,6)")]
        public decimal? Na { get; set; } // Sodium
        
        [Column(TypeName = "decimal(18,6)")]
        public decimal? NH4 { get; set; } // Ammonium
        
        [Column(TypeName = "decimal(18,6)")]
        public decimal? N { get; set; } // Nitrogen
        
        [Column(TypeName = "decimal(18,6)")]
        public decimal? SO4 { get; set; } // Sulfate
        
        [Column(TypeName = "decimal(18,6)")]
        public decimal? S { get; set; } // Sulfur
        
        [Column(TypeName = "decimal(18,6)")]
        public decimal? Cl { get; set; } // Chloride
        
        [Column(TypeName = "decimal(18,6)")]
        public decimal? H2PO4 { get; set; } // Dihydrogen phosphate
        
        [Column(TypeName = "decimal(18,6)")]
        public decimal? P { get; set; } // Phosphorus
        
        [Column(TypeName = "decimal(18,6)")]
        public decimal? HCO3 { get; set; } // Bicarbonate

        // Micronutrients Analysis
        [Column(TypeName = "decimal(18,6)")]
        public decimal? Fe { get; set; } // Iron
        
        [Column(TypeName = "decimal(18,6)")]
        public decimal? Mn { get; set; } // Manganese
        
        [Column(TypeName = "decimal(18,6)")]
        public decimal? Zn { get; set; } // Zinc
        
        [Column(TypeName = "decimal(18,6)")]
        public decimal? Cu { get; set; } // Copper
        
        [Column(TypeName = "decimal(18,6)")]
        public decimal? B { get; set; } // Boron
        
        [Column(TypeName = "decimal(18,6)")]
        public decimal? Mo { get; set; } // Molybdenum

        // Solution Properties
        [Column(TypeName = "decimal(18,6)")]
        public decimal? TDS { get; set; } // Total Dissolved Solids
        
        [Column(TypeName = "decimal(18,6)")]
        public decimal? EC { get; set; } // Electrical Conductivity
        
        [Column(TypeName = "decimal(18,6)")]
        [Range(0, 14, ErrorMessage = "pH must be between 0 and 14")]
        public decimal? PH { get; set; } // pH level

        // Navigation Properties
        public virtual Catalog Catalog { get; set; }

        // Computed Properties
        [NotMapped]
        public bool IsLowStock => CurrentStock.HasValue && MinimumStock.HasValue && CurrentStock <= MinimumStock;

        [NotMapped]
        public bool IsExpired => ExpirationDate.HasValue && ExpirationDate < DateTime.UtcNow;

        [NotMapped]
        public bool IsExpiringSoon => ExpirationDate.HasValue && 
                                     ExpirationDate < DateTime.UtcNow.AddDays(30) && 
                                     ExpirationDate >= DateTime.UtcNow;

        [NotMapped]
        public decimal? TotalNPK => (NitrogenPercentage ?? 0) + (PhosphorusPercentage ?? 0) + (PotassiumPercentage ?? 0);

        [NotMapped]
        public string NPKRatio => $"{NitrogenPercentage ?? 0:F1}-{PhosphorusPercentage ?? 0:F1}-{PotassiumPercentage ?? 0:F1}";

        [NotMapped]
        public decimal? StockValue => (CurrentStock ?? 0) * (PricePerUnit ?? 0);
    }
}