using System.Collections.Generic;
using System.Linq;

namespace AgriSmart.Tools.Entities
{
    public class PipelineMainEntity: PipelineEntity
    {
        public List<PipelineManifoldEntity> Manifolds {  get; set; }

        public PipelineMainEntity(PipelineInputEntity input) : base(input)
        {

        }

        public override double getPressureRequired()
        {
            return Manifolds[0].PressureRequired + 0.77 + getHazenWilliamsLosses() * (GroudLevelDifference / 2);
        }

        public void AddManifold(PipelineManifoldEntity manifold)
        {
            if(Manifolds == null)
                Manifolds = new List<PipelineManifoldEntity>();
            Manifolds.Add(manifold);
        }
        public override double getPipelineFlowRate()
        {
            return Manifolds.Sum(x => x.getPipelineFlowRate());
        }
        public override double getDesignCriteria()
        {
            return PipelineLength * MaximunPressureLossAllowed / 100;
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
