using System;

namespace AgriSmart.Tools.Entities
{
    public class Supply
    {
        public object Source { get; set; }
        public double Amount { get; set; } = 0;
        public string FeatureName { get; set; }

        public Supply(string featureName)
        {
            FeatureName = featureName;
        }

        public double SupplyValue
        {
            get
            {
                return getSupplyValue();
            }
        }

        private double getSupplyValue()
        {
            Type t = Source.GetType();

            if (t.Equals(typeof(FertilizerEntity)))
            {
                FertilizerEntity fertilizer = (FertilizerEntity)Source;
                FertilizerChemistryEntity chemistry = fertilizer.FertilizerChemistry;
                //this.Amount = 850;

                //string parsedFormula = FormulaCalculations.parseFormula(chemistry.Formula);
                double cmw = FormulaCalculations.getMolecularWeight(chemistry.Formula);
                //string parsedFormulaFeature = FormulaCalculations.parseFormula(FeatureName);
                double emw = FormulaCalculations.getMolecularWeight(FeatureName);
                int n = FormulaCalculations.getNCompound(chemistry.Formula, FeatureName);
                double tcw = emw * n;
                double saltMW = FormulaCalculations.getMolecularWeight(chemistry.Formula);

                double value = Amount * tcw / saltMW * chemistry.Purity / 100;

                return value;
            }
            else
            {
                WaterEntity water = (WaterEntity)Source;

                if (water.Chemistry.GetType().GetProperty(FeatureName) == null)
                    return 0;
                else
                    return (double)water.Chemistry.GetType().GetProperty(FeatureName).GetValue(water.Chemistry, null); 
            }

        }
    }
}
