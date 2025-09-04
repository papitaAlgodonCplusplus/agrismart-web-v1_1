namespace AgriSmart.Tools.Entities
{
    public class PipelineLateralEntity: PipelineEntity
    {
        public PipelineLateralEntity(PipelineInputEntity input) : base(input)
        {
        }

        public override double getPressureRequired()
        {
            return OperatingPressure + 0.77 + getHazenWilliamsLosses() * (GroudLevelDifference / 2);
        }
        public override double getPipelineFlowRate()
        {
            return (Dropper.FlowRate / 1000) * getNumberOfOutputs();
        }
        public override double getDesignCriteria()
        {
            return OperatingPressure * MaximunPressureLossAllowed / 100;
        }
        public override double getPermissibleLossAllowed()
        {
            return getDesignCriteria() * MaximunPressureLossAllowed / 100;
        }
        public override bool getAreLossesAcceptable()
        {
            if (getPermissibleLossAllowed() > getHazenWilliamsLosses())
                return true;
            else
                return false;
        }

    }
}
