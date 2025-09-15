
// Agrismart-main/AgriSmart.Calculator/Entities/
namespace AgriSmart.Calculator.Entities
{
    public class PipelineConfiguration
    {
        public double MainPipeDiameter { get; set; } // mm
        public double SecondaryPipeDiameter { get; set; } // mm
        public double LateralPipeDiameter { get; set; } // mm
        public double MainPipeLength { get; set; } // meters
        public double SecondaryPipeLength { get; set; } // meters
        public double LateralPipeLength { get; set; } // meters
        public string MainPipeMaterial { get; set; } = "PVC";
        public string SecondaryPipeMaterial { get; set; } = "PVC";
        public string LateralPipeMaterial { get; set; } = "PVC";
        public double MainPipeRoughness { get; set; } = 0.0015; // mm, for PVC
        public double SecondaryPipeRoughness { get; set; } = 0.0015; // mm
        public double LateralPipeRoughness { get; set; } = 0.0015; // mm
        public List<PipeFitting> Fittings { get; set; } = new();
    }

    public class SystemComponents
    {
        public bool HasFiltration { get; set; }
        public bool HasAutomation { get; set; }
        public bool HasFertigation { get; set; }
        public bool HasFlowMeter { get; set; }
        public bool HasPressureRegulator { get; set; }
        public bool HasBackflowPrevention { get; set; }
        public FiltrationSystem? FiltrationSystem { get; set; }
        public AutomationSystem? AutomationSystem { get; set; }
        public FertigationSystem? FertigationSystem { get; set; }
        public List<FlowMeter> FlowMeters { get; set; } = new();
        public List<PressureRegulator> PressureRegulators { get; set; } = new();
    }

    public class PipeFitting
    {
        public string Type { get; set; } = string.Empty; // elbow, tee, valve, etc.
        public double Diameter { get; set; } // mm
        public double EquivalentLength { get; set; } // meters
        public double PressureLoss { get; set; } // bar
        public int Quantity { get; set; } = 1;
    }

    public class FiltrationSystem
    {
        public string Type { get; set; } = string.Empty; // screen, disc, media, cartridge
        public double FlowRate { get; set; } // L/min
        public double PressureLoss { get; set; } // bar
        public double EfficiencyPercentage { get; set; } = 95.0;
        public int FilterCount { get; set; } = 1;
        public double MaintenanceHoursPerMonth { get; set; } = 4.0;
        public double ReplacementCostPerYear { get; set; } = 500.0;
    }

    public class AutomationSystem
    {
        public string Type { get; set; } = string.Empty; // timer, sensor-based, computerized
        public int ZoneCount { get; set; }
        public bool HasMoistureeSensors { get; set; }
        public bool HasWeatherStation { get; set; }
        public bool HasRemoteControl { get; set; }
        public double PowerConsumption { get; set; } // W
        public double MaintenanceCostPerYear { get; set; } = 300.0;
    }

    public class FertigationSystem
    {
        public string Type { get; set; } = string.Empty; // injection pump, venturi, dosatron
        public double InjectionRate { get; set; } // L/min
        public double AccuracyPercentage { get; set; } = 95.0;
        public int TankCapacity { get; set; } // liters
        public double PowerConsumption { get; set; } // W
        public double MaintenanceCostPerYear { get; set; } = 400.0;
    }

    public class FlowMeter
    {
        public string Type { get; set; } = string.Empty; // mechanical, electromagnetic, ultrasonic
        public double Diameter { get; set; } // mm
        public double MinFlowRate { get; set; } // L/min
        public double MaxFlowRate { get; set; } // L/min
        public double Accuracy { get; set; } = 2.0; // % of reading
        public double PressureLoss { get; set; } // bar
    }

    public class PressureRegulator
    {
        public string Type { get; set; } = string.Empty; // manual, automatic
        public double SetPressure { get; set; } // bar
        public double MaxFlowRate { get; set; } // L/min
        public double PressureLoss { get; set; } // bar
        public double Accuracy { get; set; } = 5.0; // % of set pressure
    }
}
