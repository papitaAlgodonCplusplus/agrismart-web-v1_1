// Agrismart-main/AgriSmart.Core/Entities/IrrigationEngineeringDesign.cs
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace AgriSmart.Core.Entities
{
    [Table("IrrigationEngineeringDesigns")]
    public class IrrigationEngineeringDesign
    {
        [Key]
        public int Id { get; set; }

        // =============================================================================
        // BASIC DESIGN INFORMATION
        // =============================================================================
        
        [Required]
        [MaxLength(200)]
        public string Name { get; set; } = string.Empty;

        [MaxLength(1000)]
        public string? Description { get; set; }

        [Required]
        [MaxLength(50)]
        public string DesignType { get; set; } = "drip"; // drip, sprinkler, micro-sprinkler

        [Required]
        [MaxLength(50)]
        public string Status { get; set; } = "draft"; // draft, completed, approved, rejected

        // =============================================================================
        // RELATIONSHIPS
        // =============================================================================

        public int? CropProductionId { get; set; }
        [ForeignKey("CropProductionId")]
        public virtual CropProduction? CropProduction { get; set; }

        public int? FarmId { get; set; }
        [ForeignKey("FarmId")] 
        public virtual Farm? Farm { get; set; }

        public int ClientId { get; set; }
        [ForeignKey("ClientId")]
        public virtual Company Client { get; set; } = null!;

        // =============================================================================
        // AREA AND PHYSICAL PARAMETERS
        // =============================================================================

        [Column(TypeName = "decimal(18,4)")]
        public decimal TotalArea { get; set; } // m²

        public int NumberOfSectors { get; set; } = 1;

        [Column(TypeName = "decimal(18,4)")]
        public decimal ContainerDensity { get; set; } // containers per m²

        [Column(TypeName = "decimal(18,4)")]
        public decimal PlantDensity { get; set; } // plants per m²

        [Column(TypeName = "decimal(18,6)")]
        public decimal DailyWaterRequirement { get; set; } // L/plant/day

        [Column(TypeName = "decimal(18,4)")]
        public decimal IrrigationFrequency { get; set; } // times per day

        // =============================================================================
        // COMPONENT SELECTIONS
        // =============================================================================

        public int? ContainerId { get; set; }
        [ForeignKey("ContainerId")]
        public virtual Container? Container { get; set; }

        public int? DropperId { get; set; }
        [ForeignKey("DropperId")]
        public virtual Dropper? Dropper { get; set; }

        public int? GrowingMediumId { get; set; }
        [ForeignKey("GrowingMediumId")]
        public virtual GrowingMedium? GrowingMedium { get; set; }

        // =============================================================================
        // CLIMATE PARAMETERS
        // =============================================================================

        [Column(TypeName = "decimal(18,2)")]
        public decimal AverageTemperature { get; set; } // °C

        [Column(TypeName = "decimal(18,2)")]
        public decimal AverageHumidity { get; set; } // %

        [Column(TypeName = "decimal(18,2)")]
        public decimal WindSpeed { get; set; } // m/s

        [Column(TypeName = "decimal(18,2)")]
        public decimal SolarRadiation { get; set; } // MJ/m²/day

        [Column(TypeName = "decimal(18,2)")]
        public decimal Elevation { get; set; } // meters above sea level

        // =============================================================================
        // WATER SOURCE PARAMETERS
        // =============================================================================

        [MaxLength(50)]
        public string WaterSourceType { get; set; } = "well"; // well, river, municipal, tank

        [Column(TypeName = "decimal(18,4)")]
        public decimal WaterPressure { get; set; } // bar

        [Column(TypeName = "decimal(18,4)")]
        public decimal WaterFlowRate { get; set; } // L/min

        // =============================================================================
        // WATER QUALITY PARAMETERS
        // =============================================================================

        [Column(TypeName = "decimal(18,2)")]
        public decimal WaterPh { get; set; } = 7.0m;

        [Column(TypeName = "decimal(18,4)")]
        public decimal ElectricalConductivity { get; set; } // dS/m

        [Column(TypeName = "decimal(18,2)")]
        public decimal TotalDissolvedSolids { get; set; } // ppm

        [Column(TypeName = "decimal(18,2)")]
        public decimal Nitrates { get; set; } // ppm

        [Column(TypeName = "decimal(18,2)")]
        public decimal Phosphorus { get; set; } // ppm

        [Column(TypeName = "decimal(18,2)")]
        public decimal Potassium { get; set; } // ppm

        [Column(TypeName = "decimal(18,2)")]
        public decimal Calcium { get; set; } // ppm

        [Column(TypeName = "decimal(18,2)")]
        public decimal Magnesium { get; set; } // ppm

        [Column(TypeName = "decimal(18,2)")]
        public decimal Sulfur { get; set; } // ppm

        [Column(TypeName = "decimal(18,2)")]
        public decimal Iron { get; set; } // ppm

        [Column(TypeName = "decimal(18,2)")]
        public decimal Manganese { get; set; } // ppm

        [Column(TypeName = "decimal(18,2)")]
        public decimal Zinc { get; set; } // ppm

        [Column(TypeName = "decimal(18,2)")]
        public decimal Copper { get; set; } // ppm

        [Column(TypeName = "decimal(18,2)")]
        public decimal Boron { get; set; } // ppm

        // =============================================================================
        // PIPELINE CONFIGURATION
        // =============================================================================

        [Column(TypeName = "decimal(18,2)")]
        public decimal MainPipeDiameter { get; set; } // mm

        [Column(TypeName = "decimal(18,2)")]
        public decimal SecondaryPipeDiameter { get; set; } // mm

        [Column(TypeName = "decimal(18,2)")]
        public decimal LateralPipeDiameter { get; set; } // mm

        [MaxLength(50)]
        public string MainPipeMaterial { get; set; } = "PVC"; // PVC, HDPE, STEEL

        [MaxLength(50)]
        public string SecondaryPipeMaterial { get; set; } = "PVC";

        [MaxLength(50)]
        public string LateralPipeMaterial { get; set; } = "PVC";

        [Column(TypeName = "decimal(18,2)")]
        public decimal MainPipeLength { get; set; } // meters

        [Column(TypeName = "decimal(18,2)")]
        public decimal SecondaryPipeLength { get; set; } // meters

        [Column(TypeName = "decimal(18,2)")]
        public decimal LateralPipeLength { get; set; } // meters

        // =============================================================================
        // SYSTEM COMPONENTS
        // =============================================================================

        public bool HasFiltration { get; set; } = false;
        public bool HasAutomation { get; set; } = false;
        public bool HasFertigation { get; set; } = false;
        public bool HasFlowMeter { get; set; } = false;
        public bool HasPressureRegulator { get; set; } = false;
        public bool HasBackflowPrevention { get; set; } = false;

        [MaxLength(100)]
        public string? FiltrationSystemType { get; set; } // screen, disc, media, etc.

        [MaxLength(100)]
        public string? AutomationSystemType { get; set; } // timer, sensor-based, computerized

        [MaxLength(100)]
        public string? FertigationSystemType { get; set; } // injection pump, venturi, dosatron

        // =============================================================================
        // CALCULATED HYDRAULIC PARAMETERS
        // =============================================================================

        [Column(TypeName = "decimal(18,4)")]
        public decimal TotalSystemFlowRate { get; set; } // L/min

        [Column(TypeName = "decimal(18,4)")]
        public decimal SystemPressureLoss { get; set; } // bar

        [Column(TypeName = "decimal(18,4)")]
        public decimal RequiredPumpPower { get; set; } // kW

        [Column(TypeName = "decimal(18,4)")]
        public decimal PumpEfficiency { get; set; } = 75.0m; // %

        [Column(TypeName = "decimal(18,4)")]
        public decimal MaxFlowVelocity { get; set; } // m/s

        [Column(TypeName = "decimal(18,4)")]
        public decimal UniformityCoefficient { get; set; } // %

        [Column(TypeName = "decimal(18,4)")]
        public decimal EmitterFlowRate { get; set; } // L/h

        [Column(TypeName = "decimal(18,4)")]
        public decimal WorkingPressure { get; set; } // bar

        [Column(TypeName = "decimal(18,2)")]
        public decimal EmitterSpacing { get; set; } // cm

        [Column(TypeName = "decimal(18,2)")]
        public decimal LateralSpacing { get; set; } // cm

        // =============================================================================
        // ECONOMIC ANALYSIS
        // =============================================================================

        [Column(TypeName = "decimal(18,2)")]
        public decimal TotalMaterialCost { get; set; } // currency

        [Column(TypeName = "decimal(18,2)")]
        public decimal InstallationCost { get; set; } // currency

        [Column(TypeName = "decimal(18,2)")]
        public decimal MaintenanceCostPerYear { get; set; } // currency/year

        [Column(TypeName = "decimal(18,2)")]
        public decimal EnergyConsumptionPerYear { get; set; } // kWh/year

        [Column(TypeName = "decimal(18,2)")]
        public decimal WaterConsumptionPerYear { get; set; } // m³/year

        [Column(TypeName = "decimal(18,2)")]
        public decimal TotalProjectCost { get; set; } // currency

        [Column(TypeName = "decimal(18,2)")]
        public decimal CostPerSquareMeter { get; set; } // currency/m²

        [Column(TypeName = "decimal(18,2)")]
        public decimal PaybackPeriod { get; set; } // years

        [Column(TypeName = "decimal(18,2)")]
        public decimal WaterSavingsPercentage { get; set; } // % vs traditional irrigation

        [Column(TypeName = "decimal(18,2)")]
        public decimal EnergySavingsPercentage { get; set; } // % vs traditional irrigation

        // =============================================================================
        // PERFORMANCE METRICS
        // =============================================================================

        [Column(TypeName = "decimal(18,2)")]
        public decimal ApplicationEfficiency { get; set; } // %

        [Column(TypeName = "decimal(18,2)")]
        public decimal DistributionUniformity { get; set; } // %

        [Column(TypeName = "decimal(18,2)")]
        public decimal WaterUseEfficiency { get; set; } // %

        [Column(TypeName = "decimal(18,2)")]
        public decimal SustainabilityScore { get; set; } // 0-100

        // =============================================================================
        // ENVIRONMENTAL FACTORS
        // =============================================================================

        [Column(TypeName = "decimal(18,2)")]
        public decimal SoilWaterHoldingCapacity { get; set; } // mm/m

        [Column(TypeName = "decimal(18,2)")]
        public decimal SoilInfiltrationRate { get; set; } // mm/h

        [MaxLength(50)]
        public string SoilType { get; set; } = "loam"; // sand, loam, clay, etc.

        [Column(TypeName = "decimal(18,2)")]
        public decimal SlopePercentage { get; set; } // %

        [MaxLength(50)]
        public string DrainageClass { get; set; } = "well"; // poor, moderate, well, excessive

        // =============================================================================
        // VALIDATION RESULTS
        // =============================================================================

        public bool IsHydraulicallyValid { get; set; } = false;
        public bool IsEconomicallyViable { get; set; } = false;
        public bool IsEnvironmentallySound { get; set; } = false;
        public bool MeetsAgronomicRequirements { get; set; } = false;

        [MaxLength(2000)]
        public string? ValidationNotes { get; set; }

        [MaxLength(2000)]
        public string? RecommendationsAndOptimizations { get; set; }

        // =============================================================================
        // COMPLEX DATA AS JSON
        // =============================================================================

        [Column(TypeName = "nvarchar(max)")]
        public string? DetailedHydraulicCalculationsJson { get; set; } // Complex hydraulic data

        [Column(TypeName = "nvarchar(max)")]
        public string? ComponentSpecificationsJson { get; set; } // Detailed component specs

        [Column(TypeName = "nvarchar(max)")]
        public string? OperationScheduleJson { get; set; } // Irrigation schedules

        [Column(TypeName = "nvarchar(max)")]
        public string? MaterialListJson { get; set; } // Bill of materials

        [Column(TypeName = "nvarchar(max)")]
        public string? InstallationInstructionsJson { get; set; } // Installation guide

        [Column(TypeName = "nvarchar(max)")]
        public string? MaintenanceScheduleJson { get; set; } // Maintenance plan

        [Column(TypeName = "nvarchar(max)")]
        public string? TechnicalDrawingsJson { get; set; } // Drawing references

        [Column(TypeName = "nvarchar(max)")]
        public string? QualityControlChecklistJson { get; set; } // QC checklist

        [Column(TypeName = "nvarchar(max)")]
        public string? RiskAssessmentJson { get; set; } // Risk analysis

        [Column(TypeName = "nvarchar(max)")]
        public string? ComplianceRequirementsJson { get; set; } // Regulatory compliance

        // =============================================================================
        // METADATA AND TRACKING
        // =============================================================================

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime? UpdatedAt { get; set; }

        public int CreatedBy { get; set; }
        [ForeignKey("CreatedBy")]
        public virtual User Creator { get; set; } = null!;

        public int? UpdatedBy { get; set; }
        [ForeignKey("UpdatedBy")]
        public virtual User? Updater { get; set; }

        public int? ApprovedBy { get; set; }
        [ForeignKey("ApprovedBy")]
        public virtual User? Approver { get; set; }

        public DateTime? ApprovedAt { get; set; }

        [MaxLength(100)]
        public string? Version { get; set; } = "1.0";

        public bool IsActive { get; set; } = true;
        public bool IsTemplate { get; set; } = false;
        public bool IsPublic { get; set; } = false;

        [MaxLength(1000)]
        public string? Tags { get; set; } // Comma-separated tags for searching

        // =============================================================================
        // CALCULATION AND PROCESSING FLAGS
        // =============================================================================

        public bool RequiresRecalculation { get; set; } = true;
        public DateTime? LastCalculatedAt { get; set; }
        public bool CalculationInProgress { get; set; } = false;

        [MaxLength(2000)]
        public string? CalculationErrors { get; set; }

        [MaxLength(500)]
        public string? CalculationNotes { get; set; }

        // =============================================================================
        // INTEGRATION AND EXPORT
        // =============================================================================

        [MaxLength(100)]
        public string? ExternalSystemId { get; set; } // For integration with CAD systems

        [MaxLength(2000)]
        public string? ExportedFilePaths { get; set; } // Paths to exported files

        public DateTime? LastExportedAt { get; set; }

        [MaxLength(100)]
        public string? ExportFormat { get; set; } // PDF, DWG, CSV, etc.

        // =============================================================================
        // MONITORING AND ALERTS
        // =============================================================================

        public bool MonitoringEnabled { get; set; } = false;
        public DateTime? LastMonitoringCheck { get; set; }

        [MaxLength(1000)]
        public string? AlertConditions { get; set; } // JSON with alert conditions

        [MaxLength(1000)]
        public string? NotificationSettings { get; set; } // JSON with notification settings
    }
}