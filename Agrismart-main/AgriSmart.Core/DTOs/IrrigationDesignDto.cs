// Agrismart-main/AgriSmart.Core/DTOs/IrrigationDesignDto.cs
using System;
using System.Collections.Generic;

namespace AgriSmart.Core.DTOs
{
    public class IrrigationDesignDto
    {
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public int CropProductionId { get; set; }
        public string DesignType { get; set; } = "drip";
        public string Status { get; set; } = "draft";
        public string Version { get; set; } = "1.0";
        
        // Design Parameters
        public IrrigationDesignParametersDto DesignParameters { get; set; } = new();
        public HydraulicParametersDto HydraulicParameters { get; set; } = new();
        public OptimizationParametersDto? OptimizationParameters { get; set; }
        
        // Results
        public IrrigationCalculationResultsDto? CalculationResults { get; set; }
        
        // Metadata
        public DateTime CreatedAt { get; set; }
        public DateTime? UpdatedAt { get; set; }
        public int CreatedBy { get; set; }
        public int? UpdatedBy { get; set; }
        public List<string> Tags { get; set; } = new();
        public bool IsTemplate { get; set; }
        public string? TemplateCategory { get; set; }
    }

    public class IrrigationDesignParametersDto
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
        public ClimateParametersDto Climate { get; set; } = new();
        public WaterSourceDto WaterSource { get; set; } = new();
        public PipelineConfigurationDto PipelineConfiguration { get; set; } = new();
        public SystemComponentsDto SystemComponents { get; set; } = new();
    }

    public class ClimateParametersDto
    {
        public double AverageTemperature { get; set; }
        public double AverageHumidity { get; set; }
        public double WindSpeed { get; set; }
        public double SolarRadiation { get; set; }
        public double Elevation { get; set; }
    }

    public class WaterSourceDto
    {
        public string SourceType { get; set; } = "well";
        public double WaterPressure { get; set; }
        public double WaterFlow { get; set; }
        public WaterQualityDto WaterQuality { get; set; } = new();
    }

    public class WaterQualityDto
    {
        public double Ph { get; set; } = 7.0;
        public double ElectricalConductivity { get; set; } = 0.8;
        public double TotalDissolvedSolids { get; set; } = 500;
        public double Nitrates { get; set; } = 10;
        public double Phosphorus { get; set; } = 2;
        public double Potassium { get; set; } = 5;
    }

    public class PipelineConfigurationDto
    {
        public double MainPipeDiameter { get; set; }
        public double SecondaryPipeDiameter { get; set; }
        public double LateralPipeDiameter { get; set; }
        public string PipelineMaterial { get; set; } = "PE";
    }

    public class SystemComponentsDto
    {
        public bool HasFiltration { get; set; }
        public bool HasAutomation { get; set; }
        public bool HasFertigation { get; set; }
        public bool HasBackflowPrevention { get; set; }
        public bool HasPressureRegulation { get; set; }
        public bool HasFlowMeter { get; set; }
    }

    public class HydraulicParametersDto
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

    public class OptimizationParametersDto
    {
        public string PrimaryObjective { get; set; } = "efficiency";
        public string OptimizationMethod { get; set; } = "genetic";
        public WeightingFactorsDto WeightingFactors { get; set; } = new();
        public ConstraintsDto Constraints { get; set; } = new();
        public int MaxIterations { get; set; } = 1000;
        public double ConvergenceTolerance { get; set; } = 0.001;
    }

    public class WeightingFactorsDto
    {
        public double Efficiency { get; set; } = 40;
        public double Cost { get; set; } = 30;
        public double Uniformity { get; set; } = 20;
        public double Sustainability { get; set; } = 10;
    }

    public class ConstraintsDto
    {
        public double MaxInvestment { get; set; }
        public double MinEfficiency { get; set; } = 85;
        public double MaxWaterConsumption { get; set; }
        public double AvailableArea { get; set; }
    }

    public class IrrigationCalculationResultsDto
    {
        public HydraulicCalculationResultDto? Hydraulic { get; set; }
        public SystemValidationResultDto? Validation { get; set; }
        public DesignOptimizationResultDto? Optimization { get; set; }
        public EconomicAnalysisResultDto? Economic { get; set; }
    }

    // Calculation Request/Response DTOs
    public class HydraulicCalculationRequestDto
    {
        public IrrigationDesignParametersDto DesignParameters { get; set; } = new();
        public HydraulicParametersDto HydraulicParameters { get; set; } = new();
        public string CalculationType { get; set; } = "comprehensive";
    }

    public class HydraulicCalculationResultDto
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
        public EmitterPerformanceResultDto EmitterPerformance { get; set; } = new();
        public SystemReliabilityResultDto SystemReliability { get; set; } = new();
        public DateTime CalculationTimestamp { get; set; }
        public bool IsValid { get; set; }
        public string? ErrorMessage { get; set; }
    }

    public class EmitterPerformanceResultDto
    {
        public double AverageFlowRate { get; set; }
        public double CoefficientOfVariation { get; set; }
        public double UniformityCoefficient { get; set; }
        public double EmissionUniformity { get; set; }
    }

    public class SystemReliabilityResultDto
    {
        public double CloggingRisk { get; set; }
        public double PressureStability { get; set; }
        public double FlowStability { get; set; }
        public double MaintenanceRequirement { get; set; }
    }

    public class QuickCalculationRequestDto
    {
        public IrrigationDesignParametersDto DesignParameters { get; set; } = new();
        public HydraulicParametersDto HydraulicParameters { get; set; } = new();
    }

    public class QuickCalculationResultDto
    {
        public double RecommendedFlowRate { get; set; }
        public double EstimatedPressureLoss { get; set; }
        public double EstimatedEfficiency { get; set; }
        public double AverageVelocity { get; set; }
        public double RecommendedSpacing { get; set; }
        public DateTime CalculationTimestamp { get; set; }
        public string? ErrorMessage { get; set; }
    }

    // System Validation DTOs
    public class SystemValidationRequestDto
    {
        public IrrigationDesignParametersDto DesignParameters { get; set; } = new();
        public HydraulicParametersDto HydraulicParameters { get; set; } = new();
        public HydraulicCalculationResultDto HydraulicResults { get; set; } = new();
    }

    public class SystemValidationResultDto
    {
        public bool IsValid { get; set; }
        public double OverallScore { get; set; }
        public List<ValidationIssueDto> Issues { get; set; } = new();
        public List<string> Recommendations { get; set; } = new();
        public PressureValidationDto PressureValidation { get; set; } = new();
        public FlowValidationDto FlowValidation { get; set; } = new();
        public UniformityValidationDto UniformityValidation { get; set; } = new();
        public TechnicalComplianceDto TechnicalCompliance { get; set; } = new();
        public PerformancePredictionDto PerformancePrediction { get; set; } = new();
    }

    public class ValidationIssueDto
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

    public class PressureValidationDto
    {
        public bool IsValid { get; set; }
        public double MinPressure { get; set; }
        public double MaxPressure { get; set; }
        public double PressureVariation { get; set; }
    }

    public class FlowValidationDto
    {
        public bool IsValid { get; set; }
        public double FlowBalance { get; set; }
        public double FlowVariation { get; set; }
        public bool AdequateFlow { get; set; }
    }

    public class UniformityValidationDto
    {
        public bool IsValid { get; set; }
        public double AchievedUniformity { get; set; }
        public double TargetUniformity { get; set; }
        public string UniformityGrade { get; set; } = string.Empty;
    }

    public class TechnicalComplianceDto
    {
        public bool VelocityCompliance { get; set; }
        public bool PressureCompliance { get; set; }
        public bool MaterialCompatibility { get; set; }
        public bool StandardsCompliance { get; set; }
    }

    public class PerformancePredictionDto
    {
        public double ExpectedLifespan { get; set; }
        public double MaintenanceFrequency { get; set; }
        public double EnergyEfficiency { get; set; }
        public double WaterUseEfficiency { get; set; }
    }

    public class ParameterValidationRequestDto
    {
        public IrrigationDesignParametersDto DesignParameters { get; set; } = new();
    }

    public class ParameterValidationResultDto
    {
        public bool IsValid { get; set; }
        public List<ValidationIssueDto> Issues { get; set; } = new();
        public List<string> Recommendations { get; set; } = new();
    }

    // Design Optimization DTOs
    public class DesignOptimizationRequestDto
    {
        public IrrigationDesignParametersDto DesignParameters { get; set; } = new();
        public HydraulicParametersDto HydraulicParameters { get; set; } = new();
        public OptimizationParametersDto OptimizationParameters { get; set; } = new();
        public HydraulicCalculationResultDto CurrentResults { get; set; } = new();
    }

    public class DesignOptimizationResultDto
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
        public OptimizedParametersDto? OptimizedParameters { get; set; }
        public List<OptimizationScenarioDto> AlternativeScenarios { get; set; } = new();
        public SensitivityAnalysisResultDto SensitivityAnalysis { get; set; } = new();
    }

    public class OptimizedParametersDto
    {
        public IrrigationDesignParametersDto? Design { get; set; }
        public HydraulicParametersDto? Hydraulic { get; set; }
        public double EmitterFlowRate { get; set; }
        public double OperatingPressure { get; set; }
        public double EmitterSpacing { get; set; }
        public PipelineDiametersDto PipelineDiameters { get; set; } = new();
    }

    public class PipelineDiametersDto
    {
        public double Main { get; set; }
        public double Secondary { get; set; }
        public double Lateral { get; set; }
    }

    public class OptimizationScenarioDto
    {
        public string Id { get; set; } = string.Empty;
        public string Name { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public double Efficiency { get; set; }
        public double Cost { get; set; }
        public double Score { get; set; }
    }

    public class SensitivityAnalysisResultDto
    {
        public double CostSensitivity { get; set; }
        public double EfficiencySensitivity { get; set; }
        public double Robustness { get; set; }
    }

    // Economic Analysis DTOs
    public class EconomicAnalysisRequestDto
    {
        public IrrigationDesignParametersDto DesignParameters { get; set; } = new();
        public HydraulicCalculationResultDto HydraulicResults { get; set; } = new();
        public EconomicParametersDto? EconomicParameters { get; set; }
    }

    public class EconomicParametersDto
    {
        public string Currency { get; set; } = "USD";
        public double DiscountRate { get; set; } = 5.0;
        public int AnalysisHorizon { get; set; } = 15;
        public double InflationRate { get; set; } = 2.5;
    }

    public class EconomicAnalysisResultDto
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
        public CostBenefitDto CostBenefit { get; set; } = new();
        public LifecycleAnalysisDto LifecycleAnalysis { get; set; } = new();
        public FinancingOptionsDto FinancingOptions { get; set; } = new();
    }

    public class CostBenefitDto
    {
        public double WaterSavingsBenefit { get; set; }
        public double LaborSavingsBenefit { get; set; }
        public double YieldImprovementBenefit { get; set; }
        public double QualityImprovementBenefit { get; set; }
        public double TotalBenefits { get; set; }
    }

    public class LifecycleAnalysisDto
    {
        public int DesignLife { get; set; }
        public double TotalLifecycleCost { get; set; }
        public double AnnualizedCost { get; set; }
        public List<ReplacementItemDto> ReplacementSchedule { get; set; } = new();
    }

    public class ReplacementItemDto
    {
        public string Component { get; set; } = string.Empty;
        public int ReplacementYear { get; set; }
        public double Cost { get; set; }
        public string Reason { get; set; } = string.Empty;
    }

    public class FinancingOptionsDto
    {
        public FinancingOptionDto CashPayment { get; set; } = new();
        public FinancingOptionDto LoanFinancing { get; set; } = new();
        public FinancingOptionDto LeaseOption { get; set; } = new();
    }

    public class FinancingOptionDto
    {
        public double TotalCost { get; set; }
        public double MonthlyPayment { get; set; }
        public double InterestRate { get; set; }
        public int Term { get; set; }
        public double TotalInterest { get; set; }
    }

    // Pipeline Design DTOs
    public class PipelineDesignRequestDto
    {
        public IrrigationDesignParametersDto DesignParameters { get; set; } = new();
        public HydraulicCalculationResultDto HydraulicResults { get; set; } = new();
    }

    public class PipelineDesignResultDto
    {
        public MainPipelineDto MainPipeline { get; set; } = new();
        public List<PipelineSectionDto> SecondaryLines { get; set; } = new();
        public List<PipelineSectionDto> LateralLines { get; set; } = new();
        public SystemLayoutDto SystemLayout { get; set; } = new();
        public MaterialsDto Materials { get; set; } = new();
    }

    public class MainPipelineDto
    {
        public double Diameter { get; set; }
        public double Length { get; set; }
        public string Material { get; set; } = string.Empty;
        public double PressureLoss { get; set; }
        public double Velocity { get; set; }
    }

    public class PipelineSectionDto
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

    public class SystemLayoutDto
    {
        public double TotalLength { get; set; }
        public int NumberOfSections { get; set; }
        public int BranchingPoints { get; set; }
        public List<double> ElevationProfile { get; set; } = new();
    }

    public class MaterialsDto
    {
        public string PipeMaterial { get; set; } = string.Empty;
        public List<string> FittingTypes { get; set; } = new();
        public double TotalMaterialCost { get; set; }
    }

    // Water Quality Analysis DTOs
    public class WaterQualityAnalysisRequestDto
    {
        public WaterQualityParametersDto WaterQualityParameters { get; set; } = new();
        public string IrrigationSystemType { get; set; } = string.Empty;
        public string CropType { get; set; } = string.Empty;
    }

    public class WaterQualityParametersDto
    {
        public double Ph { get; set; }
        public double ElectricalConductivity { get; set; }
        public double TotalDissolvedSolids { get; set; }
        public double Nitrates { get; set; }
        public double Phosphorus { get; set; }
        public double Potassium { get; set; }
        public double Calcium { get; set; }
        public double Magnesium { get; set; }
        public double Sulfur { get; set; }
    }

    public class WaterQualityAnalysisResultDto
    {
        public QualityAssessmentDto QualityAssessment { get; set; } = new();
        public CompatibilityAnalysisDto CompatibilityAnalysis { get; set; } = new();
        public string? ErrorMessage { get; set; }
    }

    public class QualityAssessmentDto
    {
        public string OverallGrade { get; set; } = string.Empty;
        public string IrrigationSuitability { get; set; } = string.Empty;
        public string CloggingRisk { get; set; } = string.Empty;
        public bool TreatmentRequired { get; set; }
        public List<string> Recommendations { get; set; } = new();
    }

    public class CompatibilityAnalysisDto
    {
        public bool EmitterCompatibility { get; set; }
        public bool PipeCompatibility { get; set; }
        public bool FertilizerCompatibility { get; set; }
        public string BiologicalRisk { get; set; } = string.Empty;
    }

    // Reporting DTOs
    public class ReportGenerationResultDto
    {
        public string ReportId { get; set; } = string.Empty;
        public string DownloadUrl { get; set; } = string.Empty;
        public string ReportType { get; set; } = string.Empty;
        public DateTime GeneratedAt { get; set; }
        public List<string> Sections { get; set; } = new();
    }

    public class TechnicalDrawingResultDto
    {
        public string DrawingId { get; set; } = string.Empty;
        public string DownloadUrl { get; set; } = string.Empty;
        public string Format { get; set; } = string.Empty;
        public string Scale { get; set; } = string.Empty;
        public List<string> Sheets { get; set; } = new();
    }

    public class BillOfMaterialsResultDto
    {
        public string BomId { get; set; } = string.Empty;
        public List<MaterialItemDto> Materials { get; set; } = new();
        public double TotalCost { get; set; }
        public List<string> Suppliers { get; set; } = new();
        public DateTime LastUpdated { get; set; }
    }

    public class MaterialItemDto
    {
        public string Description { get; set; } = string.Empty;
        public int Quantity { get; set; }
        public double UnitCost { get; set; }
        public double TotalCost { get; set; }
        public string Supplier { get; set; } = string.Empty;
    }

    // Template DTOs
    public class IrrigationTemplateDto
    {
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public string Category { get; set; } = string.Empty;
        public bool IsPublic { get; set; }
        public IrrigationDesignParametersDto DesignParameters { get; set; } = new();
        public HydraulicParametersDto HydraulicParameters { get; set; } = new();
        public DateTime CreatedAt { get; set; }
        public int CreatedBy { get; set; }
    }

    // Integration DTOs
    public class CropProductionIntegrationDto
    {
        public int CropProductionId { get; set; }
        public string CropName { get; set; } = string.Empty;
        public double Area { get; set; }
        public DateTime PlantingDate { get; set; }
        public string GrowthStage { get; set; } = string.Empty;
        public double WaterRequirement { get; set; }
        public List<string> Recommendations { get; set; } = new();
    }

    public class IoTSyncResultDto
    {
        public int DesignId { get; set; }
        public List<string> SyncedDevices { get; set; } = new();
        public DateTime SyncTimestamp { get; set; }
        public bool Success { get; set; }
        public string? ErrorMessage { get; set; }
    }

    // Compatibility DTOs
    public class CompatibilityValidationRequestDto
    {
        public IrrigationDesignParametersDto DesignParameters { get; set; } = new();
        public List<ExistingComponentDto> ExistingComponents { get; set; } = new();
    }

    public class ExistingComponentDto
    {
        public string ComponentType { get; set; } = string.Empty;
        public string Specification { get; set; } = string.Empty;
        public string Condition { get; set; } = string.Empty;
        public int Age { get; set; }
    }

    public class CompatibilityValidationResultDto
    {
        public bool IsCompatible { get; set; }
        public List<string> CompatibilityIssues { get; set; } = new();
        public List<string> Recommendations { get; set; } = new();
        public double CompatibilityScore { get; set; }
    }

    // Health Check DTO
    public class HealthCheckResultDto
    {
        public string Status { get; set; } = string.Empty;
        public DateTime Timestamp { get; set; }
        public Dictionary<string, string> Services { get; set; } = new();
        public string Version { get; set; } = string.Empty;
    }

    // Bulk Validation DTO
    public class ValidationResultDto
    {
        public int DesignId { get; set; }
        public string DesignName { get; set; } = string.Empty;
        public bool IsValid { get; set; }
        public double Score { get; set; }
        public List<string> Issues { get; set; } = new();
        public string? ErrorMessage { get; set; }
    }
}