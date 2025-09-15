// =============================================================================
// COMMANDS
// =============================================================================

// Agrismart-main/AgriSmart.Application.Agronomic/Commands/CreateIrrigationEngineeringDesignCommand.cs
using AgriSmart.Core.DTOs;
using MediatR;

namespace AgriSmart.Application.Agronomic.Commands
{
    public class CreateIrrigationEngineeringDesignCommand : IRequest<IrrigationEngineeringDesignDto>
    {
        public string Name { get; set; } = string.Empty;
        public string? Description { get; set; }
        public string DesignType { get; set; } = "drip";
        public int? CropProductionId { get; set; }
        public int? FarmId { get; set; }
        public int ClientId { get; set; }
        public decimal TotalArea { get; set; }
        public int NumberOfSectors { get; set; } = 1;
        public decimal ContainerDensity { get; set; }
        public decimal PlantDensity { get; set; }
        public decimal DailyWaterRequirement { get; set; }
        public decimal IrrigationFrequency { get; set; }
        public int? ContainerId { get; set; }
        public int? DropperId { get; set; }
        public int? GrowingMediumId { get; set; }
        public decimal AverageTemperature { get; set; }
        public decimal AverageHumidity { get; set; }
        public decimal WindSpeed { get; set; }
        public decimal SolarRadiation { get; set; }
        public decimal Elevation { get; set; }
        public string WaterSourceType { get; set; } = "well";
        public decimal WaterPressure { get; set; }
        public decimal WaterFlowRate { get; set; }
        public decimal WaterPh { get; set; } = 7.0m;
        public decimal ElectricalConductivity { get; set; }
        public decimal TotalDissolvedSolids { get; set; }
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
        public decimal MainPipeDiameter { get; set; }
        public decimal SecondaryPipeDiameter { get; set; }
        public decimal LateralPipeDiameter { get; set; }
        public string MainPipeMaterial { get; set; } = "PVC";
        public string SecondaryPipeMaterial { get; set; } = "PVC";
        public string LateralPipeMaterial { get; set; } = "PVC";
        public decimal MainPipeLength { get; set; }
        public decimal SecondaryPipeLength { get; set; }
        public decimal LateralPipeLength { get; set; }
        public bool HasFiltration { get; set; } = false;
        public bool HasAutomation { get; set; } = false;
        public bool HasFertigation { get; set; } = false;
        public bool HasFlowMeter { get; set; } = false;
        public bool HasPressureRegulator { get; set; } = false;
        public bool HasBackflowPrevention { get; set; } = false;
        public string? FiltrationSystemType { get; set; }
        public string? AutomationSystemType { get; set; }
        public string? FertigationSystemType { get; set; }
        public decimal SoilWaterHoldingCapacity { get; set; }
        public decimal SoilInfiltrationRate { get; set; }
        public string SoilType { get; set; } = "loam";
        public decimal SlopePercentage { get; set; }
        public string DrainageClass { get; set; } = "well";
        public string? Tags { get; set; }
        public bool IsTemplate { get; set; } = false;
        public bool IsPublic { get; set; } = false;
        public string? ComponentSpecificationsJson { get; set; }
        public string? OperationScheduleJson { get; set; }
        public string? MaterialListJson { get; set; }
        public string? InstallationInstructionsJson { get; set; }
        public string? MaintenanceScheduleJson { get; set; }
        public int CreatedBy { get; set; }
    }
}
