
// Agrismart-main/AgriSmart.Calculator/Entities/
namespace AgriSmart.Calculator.Entities
{
    public class HydraulicCalculationResult
    {
        public double TotalFlowRate { get; set; } // L/min
        public double PressureLoss { get; set; } // bar
        public double RequiredPower { get; set; } // kW
        public double MaxVelocity { get; set; } // m/s
        public double UniformityCoefficient { get; set; } // %
        public double EmitterFlowRate { get; set; } // L/h
        public double WorkingPressure { get; set; } // bar
        public bool IsValid { get; set; }
        public string? ValidationMessage { get; set; }
        public Dictionary<string, double> AdditionalMetrics { get; set; } = new();

        // Additional properties needed by IrrigationDesignCalculator
        public double SystemFlowRate { get; set; }
        public double TotalPressureLoss { get; set; }
        public double DistributionUniformity { get; set; }
        public double ApplicationEfficiency { get; set; }
        public double AverageVelocity { get; set; }
        public double ReynoldsNumber { get; set; }
        public DateTime CalculationTimestamp { get; set; }
        public EmitterPerformanceResult EmitterPerformance { get; set; } = new();
        public SystemReliabilityResult SystemReliability { get; set; } = new();
        public double StaticHead { get; set; }
        public double DynamicHead { get; set; }
        public string? ErrorMessage { get; set; }
        public double DesignFlowRate { get; set; }
    }

    public class EconomicAnalysisResult
    {
        public double MaterialCost { get; set; }
        public double InstallationCost { get; set; }
        public double TotalProjectCost { get; set; }
        public double TotalInvestment { get; set; }
        public double AnnualMaintenanceCost { get; set; }
        public double AnnualEnergyConsumption { get; set; } // kWh
        public double AnnualOperatingCost { get; set; }
        public double PaybackPeriod { get; set; } // years
        public double NetPresentValue { get; set; }
        public double NPV { get; set; }
        public double ReturnOnInvestment { get; set; } // %
        public double ROI { get; set; }
        public double IRR { get; set; }
        public bool IsViable { get; set; }
        public string? ValidationMessage { get; set; }
        public Dictionary<string, double> CostBreakdown { get; set; } = new();

        // Additional properties needed by EconomicAnalysisEngine
        public double EnergyCost { get; set; }
        public double WaterCost { get; set; }
        public double MaintenanceCost { get; set; }
        public double LaborCost { get; set; }
        public double ReplacementCost { get; set; }
        public double EmitterCost { get; set; }
        public double PipelineCost { get; set; }
        public double PumpingCost { get; set; }
        public double ControlCost { get; set; }
        public string? ErrorMessage { get; set; }
    }

    public class PerformanceMetricsResult
    {
        public double ApplicationEfficiency { get; set; } // %
        public double DistributionUniformity { get; set; } // %
        public double WaterUseEfficiency { get; set; } // %
        public double SustainabilityScore { get; set; } // 0-100
        public double WaterSavingsPercentage { get; set; } // % vs traditional
        public double EnergySavingsPercentage { get; set; } // % vs traditional
        public bool IsEnvironmentallySound { get; set; }
        public bool MeetsAgronomicRequirements { get; set; }
        public string? PerformanceNotes { get; set; }
        public Dictionary<string, double> PerformanceMetrics { get; set; } = new();
    }

    public class OptimizationResult
    {
        public bool HasImprovements { get; set; }
        public double PotentialCostSavings { get; set; }
        public double PotentialEfficiencyGain { get; set; }
        public List<OptimizationRecommendation> Recommendations { get; set; } = new();
        public IrrigationDesignParameters? OptimizedParameters { get; set; }
        public string? OptimizationNotes { get; set; }
    }

    public class OptimizationRecommendation
    {
        public string Parameter { get; set; } = string.Empty;
        public string CurrentValue { get; set; } = string.Empty;
        public string RecommendedValue { get; set; } = string.Empty;
        public double ImprovementPercentage { get; set; }
        public string Justification { get; set; } = string.Empty;
        public double EstimatedCostImpact { get; set; }
    }

    public class ValidationResult
    {
        public bool IsValid { get; set; }
        public List<ValidationError> Errors { get; set; } = new();
        public List<ValidationWarning> Warnings { get; set; } = new();
        public double OverallScore { get; set; } // 0-100
    }

    public class ValidationError
    {
        public string Category { get; set; } = string.Empty;
        public string Message { get; set; } = string.Empty;
        public string Severity { get; set; } = "Error";
    }

    public class ValidationWarning
    {
        public string Category { get; set; } = string.Empty;
        public string Message { get; set; } = string.Empty;
        public string Recommendation { get; set; } = string.Empty;
    }


    public class SystemValidationResult
    {
        public bool IsSystemValid { get; set; }
        public bool IsValid { get; set; }
        public double OverallScore { get; set; }
        public double OverallSystemScore { get; set; }
        public List<ValidationIssue> Issues { get; set; } = new();
        public List<string> Recommendations { get; set; } = new();
        public List<string> SystemRecommendations { get; set; } = new();
        public ValidationResult HydraulicValidation { get; set; } = new();
        public ValidationResult StructuralValidation { get; set; } = new();
        public ValidationResult EconomicValidation { get; set; } = new();
        public PressureValidation PressureValidation { get; set; } = new();
        public FlowValidation FlowValidation { get; set; } = new();
        public UniformityValidation UniformityValidation { get; set; } = new();
        public TechnicalCompliance TechnicalCompliance { get; set; } = new();
        public PerformancePrediction PerformancePrediction { get; set; } = new();
    }

    public class ParameterValidationResult
    {
        public bool AreParametersValid { get; set; }
        public bool IsValid { get; set; }
        public List<ValidationIssue> Issues { get; set; } = new();
        public List<string> Recommendations { get; set; } = new();
        public Dictionary<string, ValidationResult> ParameterValidations { get; set; } = new();
        public List<string> CriticalIssues { get; set; } = new();
        public List<string> Suggestions { get; set; } = new();
    }

    public class DesignOptimizationResult
    {
        public bool OptimizationSuccessful { get; set; }
        public IrrigationDesignParameters? OptimizedDesign { get; set; }
        public double ImprovementPercentage { get; set; }
        public List<OptimizationRecommendation> Optimizations { get; set; } = new();
        public string? OptimizationMethod { get; set; }
        public Dictionary<string, double> MetricsComparison { get; set; } = new();
        public double OverallScore { get; set; }
        public int Iterations { get; set; }
        public bool ConvergenceReached { get; set; }
        public double AchievedEfficiency { get; set; }
        public double CostReduction { get; set; }
        public double EfficiencyGain { get; set; }
        public double WaterSavings { get; set; }
        public double EnergySavings { get; set; }
    }

    public class EconomicAnalysisInput
    {
        public EconomicAnalysisParameters Parameters { get; set; } = new();
        public EconomicAnalysisParameters EconomicParameters { get; set; } = new();
        public string AnalysisType { get; set; } = "comprehensive";
        public string Currency { get; set; } = "USD";
        public IrrigationDesignParameters DesignParameters { get; set; } = new();
    }

    public class DesignOptimizationInput
    {
        public IrrigationDesignParameters CurrentDesign { get; set; } = new();
        public OptimizationParameters OptimizationParameters { get; set; } = new();
        public string OptimizationGoal { get; set; } = "efficiency";
        public List<string> ConstraintsToConsider { get; set; } = new();
        public HydraulicCalculationResult? CurrentResults { get; set; }
    }

    // Missing classes needed by existing code
    public class ValidationIssue
    {
        public string Id { get; set; } = string.Empty;
        public string Category { get; set; } = string.Empty;
        public string Severity { get; set; } = "error";
        public string Message { get; set; } = string.Empty;
        public string AffectedParameter { get; set; } = string.Empty;
        public double CurrentValue { get; set; }
        public double RecommendedValue { get; set; }
    }

    public class PressureValidation
    {
        public bool IsValid { get; set; }
        public double MinPressure { get; set; }
        public double MaxPressure { get; set; }
        public double PressureVariation { get; set; }
    }

    public class FlowValidation
    {
        public bool IsValid { get; set; }
        public double FlowBalance { get; set; }
        public double FlowVariation { get; set; }
        public bool AdequateFlow { get; set; }
    }

    public class UniformityValidation
    {
        public bool IsValid { get; set; }
        public double AchievedUniformity { get; set; }
        public double TargetUniformity { get; set; }
        public string UniformityGrade { get; set; } = string.Empty;
    }

    public class TechnicalCompliance
    {
        public bool VelocityCompliance { get; set; }
        public bool PressureCompliance { get; set; }
        public bool MaterialCompatibility { get; set; }
        public bool StandardsCompliance { get; set; }
    }

    public class PerformancePrediction
    {
        public int ExpectedLifespan { get; set; }
        public int MaintenanceFrequency { get; set; }
        public double EnergyEfficiency { get; set; }
        public double WaterUseEfficiency { get; set; }
    }

    public class QuickCalculationResult
    {
        public double FlowRate { get; set; }
        public double PressureLoss { get; set; }
        public double EstimatedCost { get; set; }
        public double ApplicationEfficiency { get; set; }
        public bool IsViable { get; set; }
        public string? Notes { get; set; }

        // Additional properties expected by Logic implementation
        public double RecommendedFlowRate { get; set; }
        public double EstimatedPressureLoss { get; set; }
        public double EstimatedEfficiency { get; set; }
        public double AverageVelocity { get; set; }
        public double RecommendedSpacing { get; set; }
        public DateTime CalculationTimestamp { get; set; }
    }

    // Additional classes needed by Logic implementation
    public class EmitterPerformanceResult
    {
        public double FlowRate { get; set; }
        public double Pressure { get; set; }
        public double DistributionUniformity { get; set; }
        public double ApplicationEfficiency { get; set; }
        public bool IsWithinSpecification { get; set; }
        public string PerformanceGrade { get; set; } = string.Empty;

        // Additional properties
        public double AverageFlowRate { get; set; }
        public double CoefficientOfVariation { get; set; }
        public double UniformityCoefficient { get; set; }
        public double EmissionUniformity { get; set; }
    }

    public class SystemReliabilityResult
    {
        public double OverallReliability { get; set; }
        public double PipelineReliability { get; set; }
        public double EmitterReliability { get; set; }
        public double ControlSystemReliability { get; set; }
        public int ExpectedLifespan { get; set; }
        public List<string> MaintenanceRequirements { get; set; } = new();
        public string ReliabilityGrade { get; set; } = string.Empty;

        // Additional properties
        public double CloggingRisk { get; set; }
        public double PressureStability { get; set; }
        public double FlowStability { get; set; }
        public double MaintenanceRequirement { get; set; }
    }
}
