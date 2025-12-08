using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace AgriSmart.Core.Entities
{
    /// <summary>
    /// Soil analysis laboratory test results
    /// </summary>
    [Table("SoilAnalysis")]
    public class SoilAnalysis : BaseEntity
    {
        // Foreign Keys
        public int? CropProductionId { get; set; }
        public int? AnalyticalEntityId { get; set; }

        // Metadata
        public DateTime? SampleDate { get; set; }

        [MaxLength(100)]
        public string LabReportNumber { get; set; }

        [MaxLength(200)]
        public string LabName { get; set; }

        [MaxLength(50)]
        public string SampleDepth { get; set; }

        [MaxLength(200)]
        public string SampleLocation { get; set; }

        // Physical Properties - Texture
        [Range(0, 100)]
        public decimal? SandPercent { get; set; }

        [Range(0, 100)]
        public decimal? SiltPercent { get; set; }

        [Range(0, 100)]
        public decimal? ClayPercent { get; set; }

        [MaxLength(50)]
        public string TextureClass { get; set; }

        public decimal? BulkDensity { get; set; }

        // Chemical Properties - General
        [Range(3.0, 10.0)]
        public decimal? PhSoil { get; set; }

        public decimal? ElectricalConductivity { get; set; }

        [Range(0, 100)]
        public decimal? OrganicMatterPercent { get; set; }

        public decimal? CationExchangeCapacity { get; set; }

        // Macronutrients - Nitrogen (ppm)
        public decimal? NitrateNitrogen { get; set; }
        public decimal? AmmoniumNitrogen { get; set; }
        public decimal? TotalNitrogen { get; set; }

        // Macronutrients - Phosphorus (ppm)
        public decimal? Phosphorus { get; set; }

        [MaxLength(50)]
        public string PhosphorusMethod { get; set; }

        // Macronutrients - Others (ppm)
        public decimal? Potassium { get; set; }
        public decimal? Calcium { get; set; }
        public decimal? CalciumCarbonate { get; set; }
        public decimal? Magnesium { get; set; }
        public decimal? Sulfur { get; set; }

        // Secondary Nutrients (ppm)
        public decimal? Sodium { get; set; }
        public decimal? Chloride { get; set; }

        // Micronutrients (ppm)
        public decimal? Iron { get; set; }
        public decimal? Manganese { get; set; }
        public decimal? Zinc { get; set; }
        public decimal? Copper { get; set; }
        public decimal? Boron { get; set; }
        public decimal? Molybdenum { get; set; }

        // Ratios and Calculated Values
        public decimal? CaToMgRatio { get; set; }
        public decimal? MgToKRatio { get; set; }
        public decimal? BasePercentCa { get; set; }
        public decimal? BasePercentMg { get; set; }
        public decimal? BasePercentK { get; set; }
        public decimal? BasePercentNa { get; set; }

        [Range(0, 100)]
        public decimal? BaseSaturationPercent { get; set; }

        // Interpretation
        [MaxLength(50)]
        public string InterpretationLevel { get; set; }

        public string Recommendations { get; set; }
        public string Notes { get; set; }

        // System Fields
        public bool? Active { get; set; } = true;

        // Navigation Properties
        [ForeignKey("CropProductionId")]
        public virtual CropProduction CropProduction { get; set; }

        [ForeignKey("AnalyticalEntityId")]
        public virtual AnalyticalEntity AnalyticalEntity { get; set; }
    }

    /// <summary>
    /// Soil texture classification reference data
    /// </summary>
    [Table("SoilTextureClass")]
    public class SoilTextureClass : BaseEntity
    {
        [Required]
        [MaxLength(50)]
        public string TextureClassName { get; set; }

        // Texture Triangle Boundaries
        [Required]
        public decimal SandMin { get; set; }
        [Required]
        public decimal SandMax { get; set; }
        [Required]
        public decimal SiltMin { get; set; }
        [Required]
        public decimal SiltMax { get; set; }
        [Required]
        public decimal ClayMin { get; set; }
        [Required]
        public decimal ClayMax { get; set; }

        // Water Holding Characteristics
        public decimal? TypicalFieldCapacity { get; set; }
        public decimal? TypicalWiltingPoint { get; set; }
        public decimal? TypicalAvailableWater { get; set; }
        public decimal? TypicalSaturatedHydraulicConductivity { get; set; }

        // Management Characteristics
        [MaxLength(50)]
        public string DrainageClass { get; set; }

        [MaxLength(50)]
        public string WorkabilityClass { get; set; }

        [MaxLength(50)]
        public string ErosionSusceptibility { get; set; }

        [MaxLength(500)]
        public string Description { get; set; }

        [Required]
        public bool Active { get; set; } = true;
    }

    /// <summary>
    /// Nutrient availability factors by pH range
    /// </summary>
    [Table("SoilNutrientAvailability")]
    public class SoilNutrientAvailability : BaseEntity
    {
        [Required]
        [MaxLength(20)]
        public string Nutrient { get; set; }

        [Required]
        public decimal PhRangeMin { get; set; }

        [Required]
        public decimal PhRangeMax { get; set; }

        [Required]
        [Range(0, 1)]
        public decimal AvailabilityFactor { get; set; }

        [MaxLength(200)]
        public string Description { get; set; }
    }
}
