
// Agrismart-main/AgriSmart.Calculator/Entities/
namespace AgriSmart.Calculator.Entities
{
    public class IrrigationDesignParameters
    {
        public double TotalArea { get; set; }
        public int NumberOfSectors { get; set; }
        public double ContainerDensity { get; set; }
        public double PlantDensity { get; set; }
        public double DailyWaterRequirement { get; set; }
        public double IrrigationFrequency { get; set; }
        public int ContainerId { get; set; }
        public int DropperId { get; set; }
        public int GrowingMediumId { get; set; }
        public ClimateParameters Climate { get; set; } = new();
        public WaterSource WaterSource { get; set; } = new();
        public PipelineConfiguration PipelineConfiguration { get; set; } = new();
        public SystemComponents SystemComponents { get; set; } = new();
        
        // Additional properties
        public string DesignType { get; set; } = "drip";
        public double MainPipeDiameter { get; set; }
        public double SecondaryPipeDiameter { get; set; }
        public double LateralPipeDiameter { get; set; }
        public bool HasFiltration { get; set; }
        public bool HasAutomation { get; set; }
        public WaterQualityParameters WaterQuality { get; set; } = new();
    }

    public class ClimateParameters
    {
        public double AverageTemperature { get; set; }
        public double AverageHumidity { get; set; }
        public double WindSpeed { get; set; }
        public double SolarRadiation { get; set; }
        public double Elevation { get; set; }
    }

    public class WaterSource
    {
        public string SourceType { get; set; } = "well";
        public double WaterPressure { get; set; }
        public double WaterFlow { get; set; }
        public WaterQualityParameters WaterQuality { get; set; } = new();
    }

    public class WaterQualityParameters
    {
        public double Ph { get; set; } = 7.0;
        public double ElectricalConductivity { get; set; } = 0.8;
        public double TotalDissolvedSolids { get; set; } = 500;
        public double Nitrates { get; set; } = 10;
        public double Phosphorus { get; set; } = 2;
        public double Potassium { get; set; } = 5;
        public double Calcium { get; set; } = 100;
        public double Magnesium { get; set; } = 50;
        public double Sulfur { get; set; } = 25;
    }

    public class PipelineConfiguration
    {
        public double MainPipeDiameter { get; set; }
        public double SecondaryPipeDiameter { get; set; }
        public double LateralPipeDiameter { get; set; }
        public string PipelineMaterial { get; set; } = "PE";
        public double PressureRating { get; set; }
        public double BuriedDepth { get; set; }
        public bool Insulation { get; set; }
        public bool CorrosionProtection { get; set; }
    }

    public class SystemComponents
    {
        public bool HasFiltration { get; set; }
        public bool HasAutomation { get; set; }
        public bool HasFertigation { get; set; }
        public bool HasBackflowPrevention { get; set; }
        public bool HasPressureRegulation { get; set; }
        public bool HasFlowMeter { get; set; }
        public bool HasLeakDetection { get; set; }
        public bool HasRemoteMonitoring { get; set; }
    }

    public class HydraulicParameters
    {
        public double OperatingPressure { get; set; }
        public double MaxFlowRate { get; set; }
        public double DesignVelocity { get; set; }
        public double FrictionLossCoefficient { get; set; }
        public double MinorLossCoefficient { get; set; }
        public double ElevationChange { get; set; }
        public double EmitterFlowRate { get; set; }
        public double EmitterSpacing { get; set; }
        public double EmitterPressure { get; set; }
        public double TargetUniformity { get; set; }
        public double PressureVariation { get; set; }
    }

    public class OptimizationParameters
    {
        public string PrimaryObjective { get; set; } = "efficiency";
        public string OptimizationMethod { get; set; } = "genetic";
        public WeightingFactors WeightingFactors { get; set; } = new();
        public Constraints Constraints { get; set; } = new();
        public int MaxIterations { get; set; } = 1000;
        public double ConvergenceTolerance { get; set; } = 0.001;
    }

    public class WeightingFactors
    {
        public double Efficiency { get; set; } = 40;
        public double Cost { get; set; } = 30;
        public double Uniformity { get; set; } = 20;
        public double Sustainability { get; set; } = 10;
    }

    public class Constraints
    {
        public double MaxInvestment { get; set; }
        public double MinEfficiency { get; set; } = 85;
        public double MaxWaterConsumption { get; set; }
        public double AvailableArea { get; set; }
    }

    public class EconomicParameters
    {
        public string Currency { get; set; } = "USD";
        public double DiscountRate { get; set; } = 5.0;
        public int AnalysisHorizon { get; set; } = 15;
        public double InflationRate { get; set; } = 2.5;
    }

    // Input Classes for Calculator
    public class HydraulicCalculationInput
    {
        public IrrigationDesignParameters DesignParameters { get; set; } = new();
        public HydraulicParameters HydraulicParameters { get; set; } = new();
        public string CalculationType { get; set; } = "comprehensive";
    }

    public class QuickCalculationInput
    {
        public IrrigationDesignParameters DesignParameters { get; set; } = new();
        public HydraulicParameters HydraulicParameters { get; set; } = new();
    }

    public class SystemValidationInput
    {
        public IrrigationDesignParameters DesignParameters { get; set; } = new();
        public HydraulicParameters HydraulicParameters { get; set; } = new();
        public HydraulicCalculationResult HydraulicResults { get; set; } = new();
    }

    public class DesignOptimizationInput
    {
        public IrrigationDesignParameters DesignParameters { get; set; } = new();
        public HydraulicParameters HydraulicParameters { get; set; } = new();
        public OptimizationParameters OptimizationParameters { get; set; } = new();
        public HydraulicCalculationResult CurrentResults { get; set; } = new();
    }

    public class EconomicAnalysisInput
    {
        public IrrigationDesignParameters DesignParameters { get; set; } = new();
        public HydraulicCalculationResult HydraulicResults { get; set; } = new();
        public EconomicParameters EconomicParameters { get; set; } = new();
    }

    public class PipelineDesignInput
    {
        public IrrigationDesignParameters DesignParameters { get; set; } = new();
        public HydraulicCalculationResult HydraulicResults { get; set; } = new();
    }

    public class WaterQualityAnalysisInput
    {
        public WaterQualityParameters WaterQualityParameters { get; set; } = new();
        public string IrrigationSystemType { get; set; } = string.Empty;
        public string CropType { get; set; } = string.Empty;
    }

    public class CompatibilityValidationInput
    {
        public IrrigationDesignParameters DesignParameters { get; set; } = new();
        public List<ExistingComponent> ExistingComponents { get; set; } = new();
    }

    public class ExistingComponent
    {
        public string ComponentType { get; set; } = string.Empty;
        public string Specification { get; set; } = string.Empty;
        public string Condition { get; set; } = string.Empty;
        public int Age { get; set; }
    }

    // Result Classes
    public class HydraulicCalculationResult
    {
        public double TotalPressureLoss { get; set; }
        public double MainLinePressureLoss { get; set; }
        public double SecondaryLinePressureLoss { get; set; }
        public double LateralLinePressureLoss { get; set; }
        public double MinorLosses { get; set; }
        public double SystemFlowRate { get; set; }
        public double DesignFlowRate { get; set; }
        public double PeakFlowRate { get; set; }
        public double AverageVelocity { get; set; }
        public double ReynoldsNumber { get; set; }
        public double DistributionUniformity { get; set; }
        public double ApplicationEfficiency { get; set; }
        public double FrictionFactor { get; set; }
        public double VelocityHead { get; set; }
        public double StaticHead { get; set; }
        public double DynamicHead { get; set; }
        public EmitterPerformanceResult EmitterPerformance { get; set; } = new();
        public SystemReliabilityResult SystemReliability { get; set; } = new();
        public DateTime CalculationTimestamp { get; set; }
        public bool IsValid { get; set; }
        public string? ErrorMessage { get; set; }
    }

    public class EmitterPerformanceResult
    {
        public double AverageFlowRate { get; set; }
        public double CoefficientOfVariation { get; set; }
        public double UniformityCoefficient { get; set; }
        public double EmissionUniformity { get; set; }
    }

    public class SystemReliabilityResult
    {
        public double CloggingRisk { get; set; }
        public double PressureStability { get; set; }
        public double FlowStability { get; set; }
        public double MaintenanceRequirement { get; set; }
    }

    public class QuickCalculationResult
    {
        public double RecommendedFlowRate { get; set; }
        public double EstimatedPressureLoss { get; set; }
        public double EstimatedEfficiency { get; set; }
        public double AverageVelocity { get; set; }
        public double RecommendedSpacing { get; set; }
        public DateTime CalculationTimestamp { get; set; }
        public string? ErrorMessage { get; set; }
    }

    public class SystemValidationResult
    {
        public bool IsValid { get; set; }
        public double OverallScore { get; set; }
        public List<ValidationIssue> Issues { get; set; } = new();
        public List<string> Recommendations { get; set; } = new();
        public PressureValidation PressureValidation { get; set; } = new();
        public FlowValidation FlowValidation { get; set; } = new();
        public UniformityValidation UniformityValidation { get; set; } = new();
        public TechnicalCompliance TechnicalCompliance { get; set; } = new();
        public PerformancePrediction PerformancePrediction { get; set; } = new();
    }

    public class ValidationIssue
    {
        public string Id { get; set; } = string.Empty;
        public string Category { get; set; } = string.Empty;
        public string Severity { get; set; } = string.Empty;
        public string Message { get; set; } = string.Empty;
        public string? Recommendation { get; set; }
        public string AffectedParameter { get; set; } = string.Empty;
        public double CurrentValue { get; set; }
        public double? RecommendedValue { get; set; }
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
        public double ExpectedLifespan { get; set; }
        public double MaintenanceFrequency { get; set; }
        public double EnergyEfficiency { get; set; }
        public double WaterUseEfficiency { get; set; }
    }

    public class ParameterValidationResult
    {
        public bool IsValid { get; set; }
        public List<ValidationIssue> Issues { get; set; } = new();
        public List<string> Recommendations { get; set; } = new();
    }

    public class DesignOptimizationResult
    {
        public int Iterations { get; set; }
        public bool ConvergenceReached { get; set; }
        public double OptimizationTime { get; set; }
        public double AchievedEfficiency { get; set; }
        public double OptimizedCost { get; set; }
        public double UniformityImprovement { get; set; }
        public double OverallScore { get; set; }
        public double CostReduction { get; set; }
        public double EfficiencyGain { get; set; }
        public double WaterSavings { get; set; }
        public double EnergySavings { get; set; }
        public OptimizedParameters? OptimizedParameters { get; set; }
        public List<OptimizationScenario> AlternativeScenarios { get; set; } = new();
        public SensitivityAnalysisResult SensitivityAnalysis { get; set; } = new();
    }

    public class OptimizedParameters
    {
        public IrrigationDesignParameters? Design { get; set; }
        public HydraulicParameters? Hydraulic { get; set; }
        public double EmitterFlowRate { get; set; }
        public double OperatingPressure { get; set; }
        public double EmitterSpacing { get; set; }
        public PipelineDiameters PipelineDiameters { get; set; } = new();
    }

    public class PipelineDiameters
    {
        public double Main { get; set; }
        public double Secondary { get; set; }
        public double Lateral { get; set; }
    }

    public class OptimizationScenario
    {
        public string Id { get; set; } = string.Empty;
        public string Name { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public double Efficiency { get; set; }
        public double Cost { get; set; }
        public double Score { get; set; }
    }

    public class SensitivityAnalysisResult
    {
        public double CostSensitivity { get; set; }
        public double EfficiencySensitivity { get; set; }
        public double Robustness { get; set; }
    }

    public class EconomicAnalysisResult
    {
        public double TotalInvestment { get; set; }
        public double PipelineCost { get; set; }
        public double EmitterCost { get; set; }
        public double PumpingCost { get; set; }
        public double ControlCost { get; set; }
        public double InstallationCost { get; set; }
        public double AnnualOperatingCost { get; set; }
        public double EnergyCost { get; set; }
        public double WaterCost { get; set; }
        public double MaintenanceCost { get; set; }
        public double LaborCost { get; set; }
        public double ReplacementCost { get; set; }
        public double PaybackPeriod { get; set; }
        public double ROI { get; set; }
        public double NPV { get; set; }
        public double IRR { get; set; }
        public CostBenefit CostBenefit { get; set; } = new();
        public LifecycleAnalysis LifecycleAnalysis { get; set; } = new();
        public FinancingOptions FinancingOptions { get; set; } = new();
        public string? ErrorMessage { get; set; }
    }

    public class CostBenefit
    {
        public double WaterSavingsBenefit { get; set; }
        public double LaborSavingsBenefit { get; set; }
        public double YieldImprovementBenefit { get; set; }
        public double QualityImprovementBenefit { get; set; }
        public double TotalBenefits { get; set; }
    }

    public class LifecycleAnalysis
    {
        public int DesignLife { get; set; }
        public double TotalLifecycleCost { get; set; }
        public double AnnualizedCost { get; set; }
        public List<ReplacementItem> ReplacementSchedule { get; set; } = new();
    }

    public class ReplacementItem
    {
        public string Component { get; set; } = string.Empty;
        public int ReplacementYear { get; set; }
        public double Cost { get; set; }
        public string Reason { get; set; } = string.Empty;
    }

    public class FinancingOptions
    {
        public FinancingOption CashPayment { get; set; } = new();
        public FinancingOption LoanFinancing { get; set; } = new();
        public FinancingOption LeaseOption { get; set; } = new();
    }

    public class FinancingOption
    {
        public double TotalCost { get; set; }
        public double MonthlyPayment { get; set; }
        public double InterestRate { get; set; }
        public int Term { get; set; }
        public double TotalInterest { get; set; }
    }

    public class PipelineDesignResult
    {
        public MainPipeline MainPipeline { get; set; } = new();
        public List<PipelineSection> SecondaryLines { get; set; } = new();
        public List<PipelineSection> LateralLines { get; set; } = new();
        public SystemLayout SystemLayout { get; set; } = new();
        public Materials Materials { get; set; } = new();
        public string? ErrorMessage { get; set; }
    }

    public class MainPipeline
    {
        public double Diameter { get; set; }
        public double Length { get; set; }
        public string Material { get; set; } = string.Empty;
        public double PressureLoss { get; set; }
        public double Velocity { get; set; }
    }

    public class PipelineSection
    {
        public string Id { get; set; } = string.Empty;
        public double Diameter { get; set; }
        public double Length { get; set; }
        public string Material { get; set; } = string.Empty;
        public double FlowRate { get; set; }
        public double Velocity { get; set; }
        public double PressureLoss { get; set; }
        public double StartElevation { get; set; }
        public double EndElevation { get; set; }
    }

    public class SystemLayout
    {
        public double TotalLength { get; set; }
        public int NumberOfSections { get; set; }
        public int BranchingPoints { get; set; }
        public List<double> ElevationProfile { get; set; } = new();
    }

    public class Materials
    {
        public string PipeMaterial { get; set; } = string.Empty;
        public List<string> FittingTypes { get; set; } = new();
        public double TotalMaterialCost { get; set; }
    }

    public class WaterQualityAnalysisResult
    {
        public QualityAssessment QualityAssessment { get; set; } = new();
        public CompatibilityAnalysis CompatibilityAnalysis { get; set; } = new();
        public string? ErrorMessage { get; set; }
    }

    public class QualityAssessment
    {
        public string OverallGrade { get; set; } = string.Empty;
        public string IrrigationSuitability { get; set; } = string.Empty;
        public string CloggingRisk { get; set; } = string.Empty;
        public bool TreatmentRequired { get; set; }
        public List<string> Recommendations { get; set; } = new();
    }

    public class CompatibilityAnalysis
    {
        public bool EmitterCompatibility { get; set; }
        public bool PipeCompatibility { get; set; }
        public bool FertilizerCompatibility { get; set; }
        public string BiologicalRisk { get; set; } = string.Empty;
    }

    public class CompatibilityValidationResult
    {
        public bool IsCompatible { get; set; }
        public List<string> CompatibilityIssues { get; set; } = new();
        public List<string> Recommendations { get; set; } = new();
        public double CompatibilityScore { get; set; }
    }

    // Report Generation Classes
    public class ReportGenerationInput
    {
        public IrrigationDesign Design { get; set; } = new();
        public string ReportType { get; set; } = string.Empty;
        public bool IncludeTechnicalDrawings { get; set; }
        public bool IncludeEconomicAnalysis { get; set; }
        public bool IncludeBillOfMaterials { get; set; }
    }

    public class ReportGenerationResult
    {
        public string ReportId { get; set; } = string.Empty;
        public string DownloadUrl { get; set; } = string.Empty;
        public string ReportType { get; set; } = string.Empty;
        public DateTime GeneratedAt { get; set; }
        public List<string> Sections { get; set; } = new();
    }

    public class TechnicalDrawingInput
    {
        public IrrigationDesign Design { get; set; } = new();
        public string DrawingType { get; set; } = string.Empty;
        public string Scale { get; set; } = string.Empty;
        public bool IncludeDetails { get; set; }
    }

    public class TechnicalDrawingResult
    {
        public string DrawingId { get; set; } = string.Empty;
        public string DownloadUrl { get; set; } = string.Empty;
        public string Format { get; set; } = string.Empty;
        public string Scale { get; set; } = string.Empty;
        public List<string> Sheets { get; set; } = new();
    }

    public class BillOfMaterialsInput
    {
        public IrrigationDesign Design { get; set; } = new();
        public bool IncludePricing { get; set; }
        public bool IncludeSuppliers { get; set; }
        public string Currency { get; set; } = "USD";
    }

    public class BillOfMaterialsResult
    {
        public string BomId { get; set; } = string.Empty;
        public List<MaterialItem> Materials { get; set; } = new();
        public double TotalCost { get; set; }
        public List<string> Suppliers { get; set; } = new();
        public DateTime LastUpdated { get; set; }
    }

    public class MaterialItem
    {
        public string Description { get; set; } = string.Empty;
        public int Quantity { get; set; }
        public double UnitCost { get; set; }
        public double TotalCost { get; set; }
        public string Supplier { get; set; } = string.Empty;
    }
}