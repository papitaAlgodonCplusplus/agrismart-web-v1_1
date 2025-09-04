using static AgriSmart.Tools.Common.Enums;

namespace AgriSmart.Tools.Entities
{
    public class PipelineInputEntity
    {
        public double PipelineLength { get; set; }
        public double NominalDiameter { get; set; }
        public double BetweenOutputDistance { get; set; }
        public PipelineMaterialType PipelineMaterialType { get; set; }
        public double OperatingPressure { get; set; }
        public double MaximunPressureLossAllowed { get; set; }
        public double GroudLevelDifference { get; set; }
        public DropperEntity Dropper { get; set; }

    }
}
