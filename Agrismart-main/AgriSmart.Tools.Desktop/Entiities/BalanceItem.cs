using System.Collections.Generic;
using System.Linq;

namespace AgriSmart.Tools.Entities
{
    public class BalanceItem
    {
        public CropPhaseSolutionRequirementItemEntity SolutionFeature { get; set; }
        public double WaterSupply
        {
            get
            {
                return getWaterSupply();
            }
        }
        public double FertilizerSupply
        {
            get
            {
                return getFertilizerSupply();
            }
        }
        public double Balance
        {
            get
            {
                return getBalance();
            }
        }
        public List<Supply> WaterSupplies;
        public List<Supply> FertilizerSupplies;

        public BalanceItem(CropPhaseSolutionRequirementItemEntity solutionFeature)
        {
            SolutionFeature = solutionFeature;
        }

        public double getWaterSupply()
        {
            return WaterSupplies.Sum(x => x.SupplyValue);
        }

        public double getFertilizerSupply()
        {
            if (FertilizerSupplies!= null)
                return FertilizerSupplies.Sum(x => x.SupplyValue);
            else
                return 0;
        }

        private double getBalance()
        {
            return SolutionFeature.Value - WaterSupply - FertilizerSupply;
        }

        public void AddSupply(Supply supply)
        {
            if (this.FertilizerSupplies == null)
                this.FertilizerSupplies = new List<Supply>();
            this.FertilizerSupplies.Add(supply);
        }

    }
}
