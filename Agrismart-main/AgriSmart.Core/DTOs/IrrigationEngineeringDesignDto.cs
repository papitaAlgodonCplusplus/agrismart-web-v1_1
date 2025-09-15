// Agrismart-main/AgriSmart.Core/DTOs/IrrigationEngineeringDesignDto.cs
using System.ComponentModel.DataAnnotations;

namespace AgriSmart.Core.DTOs
{
    // =============================================================================
    // MAIN DTO FOR GET OPERATIONS
    // =============================================================================

    public class IrrigationEngineeringDesignDto
    {
        public int Id { get; set; }

        // Basic Information
        public string Name { get; set; } = string.Empty;
        public string? Description { get; set; }
        public string DesignType { get; set; } = "drip";
        public string Status { get; set; } = "draft";

        // Relationships
        public int? CropProductionId { get; set; }
        public string? CropProductionName { get; set; }
        public int? FarmId { get; set; }
        public string? FarmName { get; set; }
        public int ClientId { get; set; }
        public string ClientName { get; set; } = string.Empty;

        // Area and Physical Parameters
        public decimal TotalArea { get; set; }
        public int NumberOfSectors { get; set; }
        public decimal ContainerDensity { get; set; }
        public decimal PlantDensity { get; set; }
        public decimal DailyWaterRequirement { get; set; }
        public decimal IrrigationFrequency { get; set; }

        // Component Selections
        public int? ContainerId { get; set; }
        public string? ContainerName { get; set; }
        public int? DropperId { get; set; }
        public string? DropperName { get; set; }
        public int? GrowingMediumId { get; set; }
        public string? GrowingMediumName { get; set; }

        // Climate Parameters
        public decimal AverageTemperature { get; set; }
        public decimal AverageHumidity { get; set; }
        public decimal WindSpeed { get; set; }
        public decimal SolarRadiation { get; set; }
        public decimal Elevation { get; set; }

        // Water Source
        public string WaterSourceType { get; set; } = "well";
        public decimal WaterPressure { get; set; }
        public decimal WaterFlowRate { get; set; }

        // Water Quality (abbreviated for listing)
        public decimal WaterPh { get; set; }
        public decimal ElectricalConductivity { get; set; }
        public decimal TotalDissolvedSolids { get; set; }

        // Pipeline Configuration
        public decimal MainPipeDiameter { get; set; }
        public decimal SecondaryPipeDiameter { get; set; }
        public decimal LateralPipeDiameter { get; set; }
        public string MainPipeMaterial { get; set; } = "PVC";

        // System Components
        public bool HasFiltration { get; set; }
        public bool HasAutomation { get; set; }
        public bool HasFertigation { get; set; }

        // Calculated Results (summary)
        public decimal TotalSystemFlowRate { get; set; }
        public decimal RequiredPumpPower { get; set; }
        public decimal UniformityCoefficient { get; set; }
        public decimal TotalProjectCost { get; set; }
        public decimal ApplicationEfficiency { get; set; }

        // Validation Status
        public bool IsHydraulicallyValid { get; set; }
        public bool IsEconomicallyViable { get; set; }
        public bool IsEnvironmentallySound { get; set; }
        public bool MeetsAgronomicRequirements { get; set; }

        // Metadata
        public DateTime CreatedAt { get; set; }
        public DateTime? UpdatedAt { get; set; }
        public string CreatorName { get; set; } = string.Empty;
        public string? Version { get; set; }
        public bool IsActive { get; set; }
        public bool RequiresRecalculation { get; set; }
    }

    // =============================================================================
    // DETAILED DTO FOR SINGLE ITEM GET
    // =============================================================================

    public class IrrigationEngineeringDesignDetailDto : IrrigationEngineeringDesignDto
    {
        // Extended Water Quality Parameters
        public decimal Nitrates { get; set; }
        public decimal Phosphorus { get; set; }
        public decimal Potassium { get; set; }
        public decimal Calcium { get; set; }
        public decimal Magnesium { get; set; }
        public decimal Sulfur { get; set; }
        public decimal Iron { get; set; }
        public decimal Manganese { get; set; }
        public decimal Zinc { get; set; }
        public decimal Copper { get; set; }
        public decimal Boron { get; set; }

        // Extended Pipeline Configuration
        public string SecondaryPipeMaterial { get; set; } = "PVC";
        public string LateralPipeMaterial { get; set; } = "PVC";
        public decimal MainPipeLength { get; set; }
        public decimal SecondaryPipeLength { get; set; }
        public decimal LateralPipeLength { get; set; }

        // Extended System Components
        public bool HasFlowMeter { get; set; }
        public bool HasPressureRegulator { get; set; }
        public bool HasBackflowPrevention { get; set; }
        public string? FiltrationSystemType { get; set; }
        public string? AutomationSystemType { get; set; }
        public string? FertigationSystemType { get; set; }

        // Extended Hydraulic Parameters
        public decimal SystemPressureLoss { get; set; }
        public decimal PumpEfficiency { get; set; }
        public decimal MaxFlowVelocity { get; set; }
        public decimal EmitterFlowRate { get; set; }
        public decimal WorkingPressure { get; set; }
        public decimal EmitterSpacing { get; set; }
        public decimal LateralSpacing { get; set; }

        // Extended Economic Analysis
        public decimal TotalMaterialCost { get; set; }
        public decimal InstallationCost { get; set; }
        public decimal MaintenanceCostPerYear { get; set; }
        public decimal EnergyConsumptionPerYear { get; set; }
        public decimal WaterConsumptionPerYear { get; set; }
        public decimal CostPerSquareMeter { get; set; }
        public decimal PaybackPeriod { get; set; }
        public decimal WaterSavingsPercentage { get; set; }
        public decimal EnergySavingsPercentage { get; set; }

        // Extended Performance Metrics
        public decimal DistributionUniformity { get; set; }
        public decimal WaterUseEfficiency { get; set; }
        public decimal SustainabilityScore { get; set; }

        // Environmental Factors
        public decimal SoilWaterHoldingCapacity { get; set; }
        public decimal SoilInfiltrationRate { get; set; }
        public string SoilType { get; set; } = "loam";
        public decimal SlopePercentage { get; set; }
        public string DrainageClass { get; set; } = "well";

        // Validation and Recommendations
        public string? ValidationNotes { get; set; }
        public string? RecommendationsAndOptimizations { get; set; }

        // Complex Data
        public string? DetailedHydraulicCalculationsJson { get; set; }
        public string? ComponentSpecificationsJson { get; set; }
        public string? OperationScheduleJson { get; set; }
        public string? MaterialListJson { get; set; }
        public string? InstallationInstructionsJson { get; set; }
        public string? MaintenanceScheduleJson { get; set; }

        // Extended Metadata
        public int? UpdatedBy { get; set; }
        public string? UpdaterName { get; set; }
        public int? ApprovedBy { get; set; }
        public string? ApproverName { get; set; }
        public DateTime? ApprovedAt { get; set; }
        public bool IsTemplate { get; set; }
        public bool IsPublic { get; set; }
        public string? Tags { get; set; }

        // Calculation Status
        public DateTime? LastCalculatedAt { get; set; }
        public bool CalculationInProgress { get; set; }
        public string? CalculationErrors { get; set; }
        public string? CalculationNotes { get; set; }
    }

    // =============================================================================
    // CREATE DTO FOR POST OPERATIONS
    // =============================================================================

    public class CreateIrrigationEngineeringDesignDto
    {
        [Required]
        [MaxLength(200)]
        public string Name { get; set; } = string.Empty;

        [MaxLength(1000)]
        public string? Description { get; set; }

        [Required]
        [MaxLength(50)]
        public string DesignType { get; set; } = "drip";

        // Relationships
        public int? CropProductionId { get; set; }
        public int? FarmId { get; set; }
        [Required]
        public int ClientId { get; set; }

        // Area and Physical Parameters
        [Range(0.01, double.MaxValue, ErrorMessage = "Total area must be greater than 0")]
        public decimal TotalArea { get; set; }

        [Range(1, 1000, ErrorMessage = "Number of sectors must be between 1 and 1000")]
        public int NumberOfSectors { get; set; } = 1;

        [Range(0, double.MaxValue)]
        public decimal ContainerDensity { get; set; }

        [Range(0, double.MaxValue)]
        public decimal PlantDensity { get; set; }

        [Range(0, double.MaxValue)]
        public decimal DailyWaterRequirement { get; set; }

        [Range(0, 24)]
        public decimal IrrigationFrequency { get; set; }

        // Component Selections
        public int? ContainerId { get; set; }
        public int? DropperId { get; set; }
        public int? GrowingMediumId { get; set; }

        // Climate Parameters
        [Range(-50, 60)]
        public decimal AverageTemperature { get; set; }

        [Range(0, 100)]
        public decimal AverageHumidity { get; set; }

        [Range(0, 50)]
        public decimal WindSpeed { get; set; }

        [Range(0, 50)]
        public decimal SolarRadiation { get; set; }

        [Range(0, 5000)]
        public decimal Elevation { get; set; }

        // Water Source
        [MaxLength(50)]
        public string WaterSourceType { get; set; } = "well";

        [Range(0, 20)]
        public decimal WaterPressure { get; set; }

        [Range(0, 10000)]
        public decimal WaterFlowRate { get; set; }

        // Water Quality Parameters
        [Range(0, 14)]
        public decimal WaterPh { get; set; } = 7.0m;

        [Range(0, 10)]
        public decimal ElectricalConductivity { get; set; }

        [Range(0, 5000)]
        public decimal TotalDissolvedSolids { get; set; }

        [Range(0, 1000)]
        public decimal Nitrates { get; set; }

        [Range(0, 1000)]
        public decimal Phosphorus { get; set; }

        [Range(0, 1000)]
        public decimal Potassium { get; set; }

        [Range(0, 1000)]
        public decimal Calcium { get; set; }

        [Range(0, 1000)]
        public decimal Magnesium { get; set; }

        [Range(0, 1000)]
        public decimal Sulfur { get; set; }

        [Range(0, 100)]
        public decimal Iron { get; set; }

        [Range(0, 100)]
        public decimal Manganese { get; set; }

        [Range(0, 100)]
        public decimal Zinc { get; set; }

        [Range(0, 100)]
        public decimal Copper { get; set; }

        [Range(0, 100)]
        public decimal Boron { get; set; }

        // Pipeline Configuration
        [Range(10, 1000)]
        public decimal MainPipeDiameter { get; set; }

        [Range(10, 1000)]
        public decimal SecondaryPipeDiameter { get; set; }

        [Range(10, 1000)]
        public decimal LateralPipeDiameter { get; set; }

        [MaxLength(50)]
        public string MainPipeMaterial { get; set; } = "PVC";

        [MaxLength(50)]
        public string SecondaryPipeMaterial { get; set; } = "PVC";

        [MaxLength(50)]
        public string LateralPipeMaterial { get; set; } = "PVC";

        [Range(0, 10000)]
        public decimal MainPipeLength { get; set; }

        [Range(0, 10000)]
        public decimal SecondaryPipeLength { get; set; }

        [Range(0, 10000)]
        public decimal LateralPipeLength { get; set; }

        // System Components
        public bool HasFiltration { get; set; } = false;
        public bool HasAutomation { get; set; } = false;
        public bool HasFertigation { get; set; } = false;
        public bool HasFlowMeter { get; set; } = false;
        public bool HasPressureRegulator { get; set; } = false;
        public bool HasBackflowPrevention { get; set; } = false;

        [MaxLength(100)]
        public string? FiltrationSystemType { get; set; }

        [MaxLength(100)]
        public string? AutomationSystemType { get; set; }

        [MaxLength(100)]
        public string? FertigationSystemType { get; set; }

        // Environmental Factors
        [Range(0, 500)]
        public decimal SoilWaterHoldingCapacity { get; set; }

        [Range(0, 1000)]
        public decimal SoilInfiltrationRate { get; set; }

        [MaxLength(50)]
        public string SoilType { get; set; } = "loam";

        [Range(0, 100)]
        public decimal SlopePercentage { get; set; }

        [MaxLength(50)]
        public string DrainageClass { get; set; } = "well";

        // Optional Advanced Settings
        [MaxLength(1000)]
        public string? Tags { get; set; }

        public bool IsTemplate { get; set; } = false;
        public bool IsPublic { get; set; } = false;

        // Complex Data as JSON strings
        public string? ComponentSpecificationsJson { get; set; }
        public string? OperationScheduleJson { get; set; }
        public string? MaterialListJson { get; set; }
        public string? InstallationInstructionsJson { get; set; }
        public string? MaintenanceScheduleJson { get; set; }
    }

    // =============================================================================
    // UPDATE DTO FOR PUT OPERATIONS
    // =============================================================================

    public class UpdateIrrigationEngineeringDesignDto
    {
        [Required]
        public int Id { get; set; }

        [Required]
        [MaxLength(200)]
        public string Name { get; set; } = string.Empty;

        [MaxLength(1000)]
        public string? Description { get; set; }

        [Required]
        [MaxLength(50)]
        public string DesignType { get; set; } = "drip";

        [MaxLength(50)]
        public string Status { get; set; } = "draft";

        // All the same validation rules as Create DTO
        public int? CropProductionId { get; set; }
        public int? FarmId { get; set; }

        [Range(0.01, double.MaxValue)]
        public decimal TotalArea { get; set; }

        [Range(1, 1000)]
        public int NumberOfSectors { get; set; }

        [Range(0, double.MaxValue)]
        public decimal ContainerDensity { get; set; }

        [Range(0, double.MaxValue)]
        public decimal PlantDensity { get; set; }

        [Range(0, double.MaxValue)]
        public decimal DailyWaterRequirement { get; set; }

        [Range(0, 24)]
        public decimal IrrigationFrequency { get; set; }

        // Component Selections
        public int? ContainerId { get; set; }
        public int? DropperId { get; set; }
        public int? GrowingMediumId { get; set; }

        // Climate Parameters
        [Range(-50, 60)]
        public decimal AverageTemperature { get; set; }

        [Range(0, 100)]
        public decimal AverageHumidity { get; set; }

        [Range(0, 50)]
        public decimal WindSpeed { get; set; }

        [Range(0, 50)]
        public decimal SolarRadiation { get; set; }

        [Range(0, 5000)]
        public decimal Elevation { get; set; }

        // Water Source
        [MaxLength(50)]
        public string WaterSourceType { get; set; } = "well";

        [Range(0, 20)]
        public decimal WaterPressure { get; set; }

        [Range(0, 10000)]
        public decimal WaterFlowRate { get; set; }

        // Water Quality Parameters
        [Range(0, 14)]
        public decimal WaterPh { get; set; }

        [Range(0, 10)]
        public decimal ElectricalConductivity { get; set; }

        [Range(0, 5000)]
        public decimal TotalDissolvedSolids { get; set; }

        [Range(0, 1000)]
        public decimal Nitrates { get; set; }

        [Range(0, 1000)]
        public decimal Phosphorus { get; set; }

        [Range(0, 1000)]
        public decimal Potassium { get; set; }

        [Range(0, 1000)]
        public decimal Calcium { get; set; }

        [Range(0, 1000)]
        public decimal Magnesium { get; set; }

        [Range(0, 1000)]
        public decimal Sulfur { get; set; }

        [Range(0, 100)]
        public decimal Iron { get; set; }

        [Range(0, 100)]
        public decimal Manganese { get; set; }

        [Range(0, 100)]
        public decimal Zinc { get; set; }

        [Range(0, 100)]
        public decimal Copper { get; set; }

        [Range(0, 100)]
        public decimal Boron { get; set; }

        // Pipeline Configuration
        [Range(10, 1000)]
        public decimal MainPipeDiameter { get; set; }

        [Range(10, 1000)]
        public decimal SecondaryPipeDiameter { get; set; }

        [Range(10, 1000)]
        public decimal LateralPipeDiameter { get; set; }

        [MaxLength(50)]
        public string MainPipeMaterial { get; set; } = "PVC";

        [MaxLength(50)]
        public string SecondaryPipeMaterial { get; set; } = "PVC";

        [MaxLength(50)]
        public string LateralPipeMaterial { get; set; } = "PVC";

        [Range(0, 10000)]
        public decimal MainPipeLength { get; set; }

        [Range(0, 10000)]
        public decimal SecondaryPipeLength { get; set; }

        [Range(0, 10000)]
        public decimal LateralPipeLength { get; set; }

        // System Components
        public bool HasFiltration { get; set; }
        public bool HasAutomation { get; set; }
        public bool HasFertigation { get; set; }
        public bool HasFlowMeter { get; set; }
        public bool HasPressureRegulator { get; set; }
        public bool HasBackflowPrevention { get; set; }

        [MaxLength(100)]
        public string? FiltrationSystemType { get; set; }

        [MaxLength(100)]
        public string? AutomationSystemType { get; set; }

        [MaxLength(100)]
        public string? FertigationSystemType { get; set; }

        // Environmental Factors
        [Range(0, 500)]
        public decimal SoilWaterHoldingCapacity { get; set; }

        [Range(0, 1000)]
        public decimal SoilInfiltrationRate { get; set; }

        [MaxLength(50)]
        public string SoilType { get; set; } = "loam";

        [Range(0, 100)]
        public decimal SlopePercentage { get; set; }

        [MaxLength(50)]
        public string DrainageClass { get; set; } = "well";

        // Economic Analysis (optional updates)
        [Range(0, double.MaxValue)]
        public decimal? TotalMaterialCost { get; set; }

        [Range(0, double.MaxValue)]
        public decimal? InstallationCost { get; set; }

        [Range(0, double.MaxValue)]
        public decimal? MaintenanceCostPerYear { get; set; }

        // Metadata Updates
        [MaxLength(1000)]
        public string? Tags { get; set; }

        public bool IsTemplate { get; set; }
        public bool IsPublic { get; set; }

        [MaxLength(100)]
        public string? Version { get; set; }

        // Complex Data Updates
        public string? ComponentSpecificationsJson { get; set; }
        public string? OperationScheduleJson { get; set; }
        public string? MaterialListJson { get; set; }
        public string? InstallationInstructionsJson { get; set; }
        public string? MaintenanceScheduleJson { get; set; }
        public string? ValidationNotes { get; set; }
        public string? RecommendationsAndOptimizations { get; set; }
    }

    // =============================================================================
    // FILTER DTO FOR QUERY OPERATIONS
    // =============================================================================

    public class IrrigationEngineeringDesignFilterDto
    {
        public int? ClientId { get; set; }
        public int? FarmId { get; set; }
        public int? CropProductionId { get; set; }
        public string? DesignType { get; set; }
        public string? Status { get; set; }
        public string? SearchTerm { get; set; }
        public bool? IsActive { get; set; } = true;
        public bool? IsTemplate { get; set; }
        public bool? RequiresRecalculation { get; set; }
        public DateTime? CreatedAfter { get; set; }
        public DateTime? CreatedBefore { get; set; }
        public decimal? MinArea { get; set; }
        public decimal? MaxArea { get; set; }
        public decimal? MinCost { get; set; }
        public decimal? MaxCost { get; set; }
        public bool? IsHydraulicallyValid { get; set; }
        public bool? IsEconomicallyViable { get; set; }
        public string? Tags { get; set; }
        public int PageNumber { get; set; } = 1;
        public int PageSize { get; set; } = 50;
        public string? SortBy { get; set; } = "CreatedAt";
        public string? SortDirection { get; set; } = "desc";
    }

    // =============================================================================
    // CALCULATION REQUEST DTO
    // =============================================================================

    public class IrrigationDesignCalculationRequestDto
    {
        [Required]
        public int DesignId { get; set; }

        public bool RecalculateHydraulics { get; set; } = true;
        public bool RecalculateEconomics { get; set; } = true;
        public bool RecalculatePerformance { get; set; } = true;
        public bool RunOptimization { get; set; } = false;

        [MaxLength(500)]
        public string? CalculationNotes { get; set; }
    }

    // =============================================================================
    // CALCULATION RESULT DTO
    // =============================================================================

    public class IrrigationDesignCalculationResultDto
    {
        public int DesignId { get; set; }
        public bool Success { get; set; }
        public DateTime CalculatedAt { get; set; }
        public string? Errors { get; set; }
        public string? Warnings { get; set; }

        // Hydraulic Results
        public decimal TotalSystemFlowRate { get; set; }
        public decimal SystemPressureLoss { get; set; }
        public decimal RequiredPumpPower { get; set; }
        public decimal UniformityCoefficient { get; set; }
        public decimal ApplicationEfficiency { get; set; }

        // Economic Results
        public decimal TotalProjectCost { get; set; }
        public decimal CostPerSquareMeter { get; set; }
        public decimal PaybackPeriod { get; set; }

        // Performance Results
        public decimal WaterUseEfficiency { get; set; }
        public decimal SustainabilityScore { get; set; }

        // Validation Results
        public bool IsHydraulicallyValid { get; set; }
        public bool IsEconomicallyViable { get; set; }
        public bool IsEnvironmentallySound { get; set; }
        public bool MeetsAgronomicRequirements { get; set; }

        public string? RecommendationsAndOptimizations { get; set; }
    }

    // =============================================================================
    // SUMMARY DTO FOR DASHBOARD/REPORTS
    // =============================================================================

    public class IrrigationDesignSummaryDto
    {
        public int TotalDesigns { get; set; }
        public int ActiveDesigns { get; set; }
        public int CompletedDesigns { get; set; }
        public int DesignsRequiringRecalculation { get; set; }
        public decimal TotalAreaDesigned { get; set; }
        public decimal AverageCostPerSquareMeter { get; set; }
        public decimal AverageEfficiency { get; set; }
        public decimal TotalProjectValue { get; set; }

        public List<DesignTypeStatDto> DesignTypeStats { get; set; } = new();
        public List<MonthlyDesignActivityDto> MonthlyActivity { get; set; } = new();
    }

    public class DesignTypeStatDto
    {
        public string DesignType { get; set; } = string.Empty;
        public int Count { get; set; }
        public decimal TotalArea { get; set; }
        public decimal AverageCost { get; set; }
    }

    public class MonthlyDesignActivityDto
    {
        public int Year { get; set; }
        public int Month { get; set; }
        public string MonthName { get; set; } = string.Empty;
        public int DesignsCreated { get; set; }
        public int DesignsCompleted { get; set; }
        public decimal TotalAreaDesigned { get; set; }
    }
}