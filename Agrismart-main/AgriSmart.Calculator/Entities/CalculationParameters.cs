
// Agrismart-main/AgriSmart.Calculator/Entities/
namespace AgriSmart.Calculator.Entities
{
    public class EconomicAnalysisParameters
    {
        public double TotalArea { get; set; }
        public string SystemType { get; set; } = string.Empty;
        public int ComponentCount { get; set; }
        public bool HasFiltration { get; set; }
        public bool HasAutomation { get; set; }
        public bool HasFertigation { get; set; }
        public Dictionary<string, double> PipelineLengths { get; set; } = new();
        public Dictionary<string, string> PipelineMaterials { get; set; } = new();
        public double RequiredPumpPower { get; set; }
        public double OperatingHoursPerDay { get; set; }
        public int OperatingDaysPerYear { get; set; }
        public double EnergyPrice { get; set; } = 0.15; // Default $/kWh
        public double LaborCostPerHour { get; set; } = 25.0; // Default $/hour
        public int ProjectLifespan { get; set; } = 15; // Default years
        public double DiscountRate { get; set; } = 0.08; // Default 8%
        public int AnalysisHorizon { get; set; } = 15; // Default years
    }

    public class PerformanceAnalysisParameters
    {
        public string DesignType { get; set; } = string.Empty;
        public double TotalArea { get; set; }
        public double WaterApplicationRate { get; set; }
        public double UniformityCoefficient { get; set; }
        public string SoilType { get; set; } = string.Empty;
        public ClimateParameters ClimateConditions { get; set; } = new();
        public SoilParameters SoilParameters { get; set; } = new();
        public CropParameters? CropParameters { get; set; }
    }

    public class SoilParameters
    {
        public double WaterHoldingCapacity { get; set; } // mm/m
        public double InfiltrationRate { get; set; } // mm/h
        public double SlopePercentage { get; set; }
        public string DrainageClass { get; set; } = "well";
        public double BulkDensity { get; set; } = 1.3; // g/cm³
        public double OrganicMatter { get; set; } = 2.5; // %
    }

    public class CropParameters
    {
        public string CropType { get; set; } = string.Empty;
        public double CropCoefficient { get; set; } = 1.0;
        public double RootDepth { get; set; } = 0.5; // meters
        public double CriticalPeriodStart { get; set; } = 30; // days from planting
        public double CriticalPeriodEnd { get; set; } = 90; // days from planting
        public double YieldGoal { get; set; } // kg/ha or tons/ha
        public double WaterStressSensitivity { get; set; } = 1.0; // 0-2 scale
    }

    public class OptimizationParameters
    {
        public IrrigationDesignParameters CurrentDesign { get; set; } = new();
        public List<string> OptimizationCriteria { get; set; } = new(); // cost, efficiency, sustainability
        public Dictionary<string, object> Constraints { get; set; } = new();
        public double CostWeight { get; set; } = 0.4;
        public double EfficiencyWeight { get; set; } = 0.4;
        public double SustainabilityWeight { get; set; } = 0.2;
        public int MaxIterations { get; set; } = 100;
        public double ConvergenceTolerance { get; set; } = 0.01;
        public bool OptimizePipeSizing { get; set; } = true;
        public bool OptimizeEmitterSpacing { get; set; } = true;
        public bool OptimizeSystemPressure { get; set; } = true;
        public bool ConsiderMultipleDesignTypes { get; set; } = false;
        public string OptimizationMethod { get; set; } = "genetic_algorithm";
    }
}
