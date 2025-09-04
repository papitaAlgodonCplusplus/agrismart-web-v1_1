using AgriSmart.Tools.DataModels;
using AgriSmart.Tools.Common;
using System;
using System.Collections.Generic;

namespace AgriSmart.Tools.Entities
{
    public class WaterEntity: BaseEntity
    {
        public int CatalogsId { get; set; }
        public List<WaterChemistryEntity> Chemistries { get; set; }
        public bool Selected { get; set; }

        public WaterEntity()
        {
        }

        public WaterEntity(WaterModel model, List<WaterChemistryEntity> chemitries)
        {
            this.CopyPropertiesFrom(model);
            Chemistries = chemitries;
        }

        public WaterChemistryEntity Chemistry
        {
            get
            {
                return getWaterChemistry();
            }
        }

        public double getAcidConcentration(FertilizerEntity fertilizer,  double waterHCO3, double pHTarget, Enums.ConcentrationUnit concentrationUnit)
        {
            double acidConcentration = waterHCO3 / (1 + Math.Pow(10, (pHTarget - Constants.pHCOST)));

            FertilizerChemistryEntity chemistry = fertilizer.FertilizerChemistry;

            double M = 1;

            if (concentrationUnit == Enums.ConcentrationUnit.mmolL)
            {
                M = FormulaCalculations.getMolecularWeight(fertilizer.FertilizerChemistry.Formula);
            }

            //return acidConcentration * M / chemistry.Valencia * chemistry.Density * (chemistry.Purity/100);

            return acidConcentration;

        }

        private WaterChemistryEntity getWaterChemistry()
        {
            return Chemistries[0];
        }
    }
}
