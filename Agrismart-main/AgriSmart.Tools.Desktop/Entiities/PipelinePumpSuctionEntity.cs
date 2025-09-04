namespace AgriSmart.Tools.Entities
{
    public class PipelinePumpSuctionEntity : PipelineEntity
    {
        PipelineMainEntity Main { get; set; }
        public PipelinePumpSuctionEntity(PipelineInputEntity input, PipelineMainEntity main) : base(input)
        {
            Main = main;
        }

        public override double getPressureRequired()
        {
            return Main.PressureRequired + 0.77 + getHazenWilliamsLosses() * (GroudLevelDifference / 2);
        }
        public override double getPipelineFlowRate()
        {
            return Main.FlowRate;

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
