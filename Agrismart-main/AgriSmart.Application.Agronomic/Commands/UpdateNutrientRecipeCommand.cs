
using AgriSmart.Application.Agronomic.Responses.Commands;
using AgriSmart.Core.Responses;
using MediatR;

namespace AgriSmart.Application.Agronomic.Commands
{
    public class UpdateNutrientRecipeCommand : IRequest<Response<UpdateNutrientRecipeResponse>>
    {
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string? Description { get; set; }
        public int CropId { get; set; }
        public int CropPhaseId { get; set; }
        public int? WaterSourceId { get; set; }
        
        public double TargetPh { get; set; }
        public double TargetEc { get; set; }
        public double VolumeLiters { get; set; }
        
        public double TargetNitrogen { get; set; }
        public double TargetPhosphorus { get; set; }
        public double TargetPotassium { get; set; }
        public double? TargetCalcium { get; set; }
        public double? TargetMagnesium { get; set; }
        public double? TargetSulfur { get; set; }
        public double? TargetIron { get; set; }
        
        public double? AchievedNitrogen { get; set; }
        public double? AchievedPhosphorus { get; set; }
        public double? AchievedPotassium { get; set; }
        public double? AchievedCalcium { get; set; }
        public double? AchievedMagnesium { get; set; }
        public double? AchievedSulfur { get; set; }
        public double? AchievedIron { get; set; }
        
        public decimal? TotalCost { get; set; }
        public decimal? CostPerLiter { get; set; }
        public string? RecipeType { get; set; }
        public string? Instructions { get; set; }
        public string? Warnings { get; set; }
        public string? Notes { get; set; }

        // Soil/Fertigation Parameters
        public int? SoilAnalysisId { get; set; }
        public string? FormulationMode { get; set; }
        public double? FertigationVolumePerApplication { get; set; }
        public int? FertigationApplicationsPerWeek { get; set; }
        public double? FertigationLeachingFraction { get; set; }
        public double? FertigationRootDepth { get; set; }

        // Achievement Percentages
        public double? PercentageNitrogen { get; set; }
        public double? PercentagePhosphorus { get; set; }
        public double? PercentagePotassium { get; set; }
        public double? PercentageCalcium { get; set; }
        public double? PercentageMagnesium { get; set; }

        // Result Summary
        public string? StatusMessage { get; set; }
        public string? SummaryLine { get; set; }

        // Advanced Calculator Specific Fields
        public string? OptimizationMethod { get; set; }
        public string? OptimizationStatus { get; set; }
        public double? TotalDosageGramsPerLiter { get; set; }
        public double? SolverTimeSeconds { get; set; }
        public double? IonicBalanceError { get; set; }
        public double? AverageDeviationPercent { get; set; }
        public double? SuccessRatePercent { get; set; }
        public string? CalculationResultsJson { get; set; }

        // Advanced Calculation Data - Nested JSON Storage
        public string? CalculationDataUsedJson { get; set; }
        public string? IntegrationMetadataJson { get; set; }
        public string? OptimizationSummaryJson { get; set; }
        public string? PerformanceMetricsJson { get; set; }
        public string? CostAnalysisJson { get; set; }
        public string? NutrientDiagnosticsJson { get; set; }
        public string? LinearProgrammingAnalysisJson { get; set; }
        public string? DataSourcesJson { get; set; }
        public string? FertilizerDosagesJson { get; set; }
        public string? VerificationResultsJson { get; set; }

        // Quick Access Fields for Advanced Calculations
        public bool? LinearProgrammingEnabled { get; set; }
        public int? ActiveFertilizerCount { get; set; }
        public DateTime? CalculationTimestamp { get; set; }
        public int? CatalogIdUsed { get; set; }
        public int? PhaseIdUsed { get; set; }
        public int? WaterIdUsed { get; set; }
        public int? UserIdUsed { get; set; }
        public decimal? ApiPriceCoveragePercent { get; set; }
        public decimal? CostPerM3Crc { get; set; }
        public int? FertilizersAnalyzed { get; set; }
        public bool? SafetyCapsApplied { get; set; }
        public bool? StrictCapsMode { get; set; }

        // Additional Nutrients
        public double? TargetChloride { get; set; }
        public double? AchievedChloride { get; set; }
        public double? TargetSodium { get; set; }
        public double? AchievedSodium { get; set; }
        public double? TargetAmmonium { get; set; }
        public double? AchievedAmmonium { get; set; }
        public double? TargetManganese { get; set; }
        public double? AchievedManganese { get; set; }
        public double? TargetZinc { get; set; }
        public double? AchievedZinc { get; set; }
        public double? TargetCopper { get; set; }
        public double? AchievedCopper { get; set; }
        public double? TargetBoron { get; set; }
        public double? AchievedBoron { get; set; }
        public double? TargetMolybdenum { get; set; }
        public double? AchievedMolybdenum { get; set; }

        // PDF Report
        public string? PdfReportFilename { get; set; }
        public bool? PdfReportGenerated { get; set; }

        public List<RecipeFertilizerDto>? Fertilizers { get; set; }
    }
}