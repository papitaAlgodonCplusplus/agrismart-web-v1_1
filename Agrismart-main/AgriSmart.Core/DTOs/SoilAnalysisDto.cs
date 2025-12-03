using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;

namespace AgriSmart.Core.DTOs
{
    /// <summary>
    /// DTO for creating/updating soil analysis
    /// </summary>
    public class SoilAnalysisDto
    {
        public int? Id { get; set; }

        [Required]
        public int CropProductionId { get; set; }

        public int? AnalyticalEntityId { get; set; }

        [Required]
        public DateTime SampleDate { get; set; }

        public string LabReportNumber { get; set; }
        public string LabName { get; set; }
        public string SampleDepth { get; set; }
        public string SampleLocation { get; set; }

        // Texture
        [Range(0, 100)]
        public decimal? SandPercent { get; set; }

        [Range(0, 100)]
        public decimal? SiltPercent { get; set; }

        [Range(0, 100)]
        public decimal? ClayPercent { get; set; }

        public string TextureClass { get; set; }
        public decimal? BulkDensity { get; set; }

        // Chemical
        [Range(3.0, 10.0)]
        public decimal? PhSoil { get; set; }

        public decimal? ElectricalConductivity { get; set; }

        [Range(0, 100)]
        public decimal? OrganicMatterPercent { get; set; }

        public decimal? CationExchangeCapacity { get; set; }

        // Nutrients
        public decimal? NitrateNitrogen { get; set; }
        public decimal? AmmoniumNitrogen { get; set; }
        public decimal? TotalNitrogen { get; set; }
        public decimal? Phosphorus { get; set; }
        public string PhosphorusMethod { get; set; }
        public decimal? Potassium { get; set; }
        public decimal? Calcium { get; set; }
        public decimal? Magnesium { get; set; }
        public decimal? Sulfur { get; set; }
        public decimal? Sodium { get; set; }
        public decimal? Chloride { get; set; }
        public decimal? Iron { get; set; }
        public decimal? Manganese { get; set; }
        public decimal? Zinc { get; set; }
        public decimal? Copper { get; set; }
        public decimal? Boron { get; set; }
        public decimal? Molybdenum { get; set; }

        // Interpretation
        public string InterpretationLevel { get; set; }
        public string Recommendations { get; set; }
        public string Notes { get; set; }
    }

    /// <summary>
    /// DTO for returning soil analysis with calculated values
    /// </summary>
    public class SoilAnalysisResponseDto : SoilAnalysisDto
    {
        public DateTime DateCreated { get; set; }
        public DateTime? DateUpdated { get; set; }
        public bool Active { get; set; }

        // Calculated properties
        public decimal? CaToMgRatio { get; set; }
        public decimal? MgToKRatio { get; set; }
        public decimal? BaseSaturationPercent { get; set; }

        // Texture classification info
        public SoilTextureInfoDto TextureInfo { get; set; }

        // Available nutrients (pH-adjusted)
        public Dictionary<string, AvailableNutrientDto> AvailableNutrients { get; set; }
    }

    /// <summary>
    /// Soil texture information
    /// </summary>
    public class SoilTextureInfoDto
    {
        public string TextureClassName { get; set; }
        public string Description { get; set; }
        public decimal? TypicalFieldCapacity { get; set; }
        public decimal? TypicalWiltingPoint { get; set; }
        public decimal? TypicalAvailableWater { get; set; }
        public string DrainageClass { get; set; }
        public string WorkabilityClass { get; set; }
    }

    /// <summary>
    /// Available nutrient calculation
    /// </summary>
    public class AvailableNutrientDto
    {
        public string Nutrient { get; set; }
        public decimal SoilTestValue { get; set; }
        public decimal AvailabilityFactor { get; set; }
        public decimal AvailableAmount { get; set; }
        public string Unit { get; set; } = "ppm";
    }

    /// <summary>
    /// Texture validation result
    /// </summary>
    public class TextureValidationDto
    {
        public bool IsValid { get; set; }
        public string TextureClass { get; set; }
        public string ErrorMessage { get; set; }
        public SoilTextureInfoDto TextureInfo { get; set; }
    }
}
