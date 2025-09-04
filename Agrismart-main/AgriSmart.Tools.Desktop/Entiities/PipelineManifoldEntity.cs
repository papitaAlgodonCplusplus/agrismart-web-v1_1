using System.Collections.Generic;
using System.Linq;

namespace AgriSmart.Tools.Entities
{
    public class PipelineManifoldEntity: PipelineEntity
    {
        public List<PipelineLateralEntity> Laterals { get; set; }

        public PipelineManifoldEntity(PipelineInputEntity input) : base(input)
        {

        }

        public void AddPipelineLateral(PipelineLateralEntity pipelineLateral)
        {
            if(Laterals == null)    
                Laterals = new List<PipelineLateralEntity>();
            Laterals.Add(pipelineLateral);
        }

        public override double getPressureRequired()
        {
            return Laterals[0].PressureRequired + 0.77 + getHazenWilliamsLosses() * (GroudLevelDifference / 2);
        }
        public override double getPipelineFlowRate()
        {
            return Laterals.Sum(x=> x.getPipelineFlowRate());
        }
        public override double getDesignCriteria()
        {
            return Laterals[0].DesingCriteria - Laterals[0].HazenWilliamsLosses;
        }
        public override double getPermissibleLossAllowed()
        {
            return 0;
        }
        public override bool getAreLossesAcceptable()
        {
            if (getDesignCriteria() > getHazenWilliamsLosses())
                return true;
            else
                return false;
        }


    }
}
