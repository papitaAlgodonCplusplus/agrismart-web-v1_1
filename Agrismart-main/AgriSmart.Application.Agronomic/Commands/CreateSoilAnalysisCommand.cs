using AgriSmart.Application.Agronomic.Responses.Commands;
using AgriSmart.Core.Responses;
using MediatR;
using System;

namespace AgriSmart.Application.Agronomic.Commands
{
    public class CreateSoilAnalysisCommand : IRequest<Response<CreateSoilAnalysisResponse>>
    {
        public int CropProductionId { get; set; }
        public DateTime SampleDate { get; set; }
        public string LabReportNumber { get; set; }
        public string LabName { get; set; }
        public string SampleDepth { get; set; }
        public string SampleLocation { get; set; }

        // Texture Properties
        public decimal? SandPercent { get; set; }
        public decimal? SiltPercent { get; set; }
        public decimal? ClayPercent { get; set; }
        public string TextureClass { get; set; }
        public decimal? BulkDensity { get; set; }

        // Chemical Properties
        public decimal? PhSoil { get; set; }
        public decimal? ElectricalConductivity { get; set; }
        public decimal? OrganicMatterPercent { get; set; }
        public decimal? CationExchangeCapacity { get; set; }

        // Macronutrients
        public decimal? NitrateNitrogen { get; set; }
        public decimal? AmmoniumNitrogen { get; set; }
        public decimal? TotalNitrogen { get; set; }
        public decimal? Phosphorus { get; set; }
        public string PhosphorusMethod { get; set; }
        public decimal? Potassium { get; set; }
        public decimal? Calcium { get; set; }
        public decimal? Magnesium { get; set; }
        public decimal? Sulfur { get; set; }

        // Secondary Nutrients
        public decimal? Sodium { get; set; }
        public decimal? Chloride { get; set; }

        // Micronutrients
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
}
