// Agrismart-main/AgriSmart.Calculator/Entities/
using AgriSmart.Core.Entities;

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
        public double MainPipeLength { get; set; } = 100;
        public double SecondaryPipeLength { get; set; } = 200;
        public double LateralPipeLength { get; set; } = 300;
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
        public List<string> ValidationCriteria { get; set; } = new();
        public string ValidationLevel { get; set; } = "basic"; // basic, intermediate, comprehensive
    }


    public class ComponentSpecification
    {
        public string ComponentType { get; set; } = string.Empty;
        public string Brand { get; set; } = string.Empty;
        public string Model { get; set; } = string.Empty;
        public Dictionary<string, object> Specifications { get; set; } = new();
        public double UnitCost { get; set; }
        public int Quantity { get; set; }
        public string Condition { get; set; } = string.Empty;
        public int Age { get; set; }
    }
}