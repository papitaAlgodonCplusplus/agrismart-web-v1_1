// Agrismart-main/AgriSmart.Core/Entities/CropPhaseSolutionRequirement.cs
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace AgriSmart.Core.Entities
{
    [Table("CropPhaseSolutionRequirement")]
    public class CropPhaseSolutionRequirement
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int Id { get; set; }

        [Column(TypeName = "datetime")]
        public DateTime? DateCreated { get; set; }

        [Column(TypeName = "datetime")]
        public DateTime? DateUpdated { get; set; }

        public int? CreatedBy { get; set; }
        public int? UpdatedBy { get; set; }

        // ENHANCED: Add CropPhaseId field (optional, can be null for backwards compatibility)
        public int? CropPhaseId { get; set; }

        // Keep original PhaseId for backwards compatibility
        public int PhaseId { get; set; }

        // Solution Chemistry Parameters
        [Column(TypeName = "decimal(18,6)")]
        public decimal EC { get; set; } // Electrical Conductivity

        [Column(TypeName = "decimal(18,6)")]
        public decimal HCO3 { get; set; } // Bicarbonate

        [Column(TypeName = "decimal(18,6)")]
        public decimal NO3 { get; set; } // Nitrate

        [Column(TypeName = "decimal(18,6)")]
        public decimal H2PO4 { get; set; } // Dihydrogen Phosphate

        [Column(TypeName = "decimal(18,6)")]
        public decimal SO4 { get; set; } // Sulfate

        [Column(TypeName = "decimal(18,6)")]
        public decimal Cl { get; set; } // Chloride

        [Column(TypeName = "decimal(18,6)")]
        public decimal NH4 { get; set; } // Ammonium

        [Column(TypeName = "decimal(18,6)")]
        public decimal K { get; set; } // Potassium

        [Column(TypeName = "decimal(18,6)")]
        public decimal Ca { get; set; } // Calcium

        [Column(TypeName = "decimal(18,6)")]
        public decimal Mg { get; set; } // Magnesium

        [Column(TypeName = "decimal(18,6)")]
        public decimal Na { get; set; } // Sodium

        // ENHANCED: Additional micronutrients and parameters
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

        // ENHANCED: Solution Properties
        [Column(TypeName = "decimal(18,2)")]
        public decimal? pH { get; set; } // pH Level

        [Column(TypeName = "decimal(18,2)")]
        public decimal? Temperature { get; set; } // Optimal temperature

        // ENHANCED: Additional Information
        [MaxLength(500)]
        public string? Notes { get; set; }

        [MaxLength(100)]
        public string? Name { get; set; }

        [MaxLength(1000)]
        public string? Description { get; set; }

        // Status
        public bool? Active { get; set; } = true;

        // ENHANCED: Validation and Quality Control
        public bool IsValidated { get; set; } = false;

        [Column(TypeName = "datetime")]
        public DateTime? ValidatedAt { get; set; }

        public int? ValidatedBy { get; set; }

        [MaxLength(1000)]
        public string? ValidationNotes { get; set; }

        // ENHANCED: Usage tracking
        public int UsageCount { get; set; } = 0;

        [Column(TypeName = "datetime")]
        public DateTime? LastUsedAt { get; set; }

        // Navigation Properties
        public CropPhase? CropPhase { get; set; }

        // ENHANCED: Constructor
        public CropPhaseSolutionRequirement()
        {
            DateCreated = DateTime.UtcNow;
            Active = true;
            IsValidated = false;
            UsageCount = 0;
        }

        // ENHANCED: Helper Methods
        public decimal GetTotalNutrients()
        {
            return NO3 + NH4 + H2PO4 + K + Ca + Mg + SO4;
        }

        public decimal GetTotalMicronutrients()
        {
            return (Fe ?? 0) + (Mn ?? 0) + (Zn ?? 0) + (Cu ?? 0) + (B ?? 0) + (Mo ?? 0);
        }

        public string GetNPKRatio()
        {
            var n = NO3 + NH4;
            var p = H2PO4;
            var k = K;

            if (n == 0 && p == 0 && k == 0) return "0-0-0";

            var total = n + p + k;
            if (total == 0) return "0-0-0";

            var nRatio = Math.Round((decimal)((n / total) * 100), 1);
            var pRatio = Math.Round((decimal)((p / total) * 100), 1);
            var kRatio = Math.Round((decimal)((k / total) * 100), 1);

            return $"{nRatio}-{pRatio}-{kRatio}";
        }

        public bool IsBalanced()
        {
            var totalMacro = NO3 + NH4 + H2PO4 + K + Ca + Mg + SO4;
            var totalMicro = GetTotalMicronutrients();

            // Basic validation - macro nutrients should be much higher than micro
            return totalMacro > 0 && (totalMicro == 0 || totalMacro / totalMicro > 100);
        }

        public void MarkAsUsed()
        {
            UsageCount++;
            LastUsedAt = DateTime.UtcNow;
        }

        public void Validate(int validatedBy, string? notes = null)
        {
            IsValidated = true;
            ValidatedAt = DateTime.UtcNow;
            ValidatedBy = validatedBy;
            ValidationNotes = notes;
        }
    }
}