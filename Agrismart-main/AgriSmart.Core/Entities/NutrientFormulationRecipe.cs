
using System.ComponentModel.DataAnnotations.Schema;

namespace AgriSmart.Core.Entities
{
    public class NutrientFormulationRecipe : BaseEntity
    {
        public string Name { get; set; } = string.Empty;
        public string? Description { get; set; }
        
        // References
        public int CropId { get; set; }
        public int CropPhaseId { get; set; }
        public int? WaterSourceId { get; set; }
        public int CatalogId { get; set; } = -1;
        
        // Target Parameters
        public double TargetPh { get; set; }
        public double TargetEc { get; set; }
        public double VolumeLiters { get; set; } = 1000;
        
        // Target Nutrients (ppm or mg/L)
        public double TargetNitrogen { get; set; }
        public double TargetPhosphorus { get; set; }
        public double TargetPotassium { get; set; }
        public double? TargetCalcium { get; set; }
        public double? TargetMagnesium { get; set; }
        public double? TargetSulfur { get; set; }
        public double? TargetIron { get; set; }
        public double? TargetManganese { get; set; }
        public double? TargetZinc { get; set; }
        public double? TargetCopper { get; set; }
        public double? TargetBoron { get; set; }
        public double? TargetMolybdenum { get; set; }
        
        // Achieved Results
        public double? AchievedNitrogen { get; set; }
        public double? AchievedPhosphorus { get; set; }
        public double? AchievedPotassium { get; set; }
        public double? AchievedCalcium { get; set; }
        public double? AchievedMagnesium { get; set; }
        public double? AchievedSulfur { get; set; }
        public double? AchievedIron { get; set; }
        public double? AchievedManganese { get; set; }
        public double? AchievedZinc { get; set; }
        public double? AchievedCopper { get; set; }
        public double? AchievedBoron { get; set; }
        public double? AchievedMolybdenum { get; set; }
        
        // Cost Information
        public decimal? TotalCost { get; set; }
        public decimal? CostPerLiter { get; set; }
        
        // Additional Metadata
        public string? RecipeType { get; set; } // 'Simple' or 'Advanced'
        public string? Instructions { get; set; } // JSON array
        public string? Warnings { get; set; } // JSON array
        public string? Notes { get; set; }

        // Soil/Fertigation Specific Parameters
        public int? SoilAnalysisId { get; set; }
        public string? FormulationMode { get; set; } // "Hydroponics" or "Soil"
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
        public string? OptimizationMethod { get; set; } // "linear_programming", "sequential_least_squares", etc.
        public string? OptimizationStatus { get; set; } // "Optimal", "Feasible", etc.
        public double? TotalDosageGramsPerLiter { get; set; }
        public double? SolverTimeSeconds { get; set; }
        public double? IonicBalanceError { get; set; }
        public double? AverageDeviationPercent { get; set; }
        public double? SuccessRatePercent { get; set; }
        public string? CalculationResultsJson { get; set; } // Full JSON for advanced calculator results

        // Advanced Calculation Data - Nested JSON Storage
        public string? CalculationDataUsedJson { get; set; } // Stores calculation_data_used with all nested objects
        public string? IntegrationMetadataJson { get; set; } // Stores integration_metadata
        public string? OptimizationSummaryJson { get; set; } // Stores optimization_summary
        public string? PerformanceMetricsJson { get; set; } // Stores performance_metrics
        public string? CostAnalysisJson { get; set; } // Stores cost_analysis with all nested objects
        public string? NutrientDiagnosticsJson { get; set; } // Stores nutrient_diagnostics
        public string? LinearProgrammingAnalysisJson { get; set; } // Stores linear_programming_analysis
        public string? DataSourcesJson { get; set; } // Stores data_sources
        public string? FertilizerDosagesJson { get; set; } // Stores fertilizer_dosages
        public string? VerificationResultsJson { get; set; } // Stores verification_results array

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

        // PDF Report
        public string? PdfReportFilename { get; set; }
        public bool? PdfReportGenerated { get; set; }

        // Navigation Properties
        [NotMapped]
        public virtual Crop? Crop { get; set; }
        
        [NotMapped]
        public virtual CropPhase? CropPhase { get; set; }
        
        [NotMapped]
        public virtual ICollection<NutrientFormulationRecipeFertilizer> Fertilizers { get; set; } 
            = new List<NutrientFormulationRecipeFertilizer>();
    }
}