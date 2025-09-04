using AgriSmart.Core.Entities;
using AgriSmart.Tools.DataModels;
using System.Collections.Generic;

namespace AgriSmart.Tools.Entities
{
    public class CropPhaseSolutionRequirementEntity: BaseEntity
    {
        public int PhaseId { get; set; }
        public CropPhaseEntity CropPhase { get; set; }
        public List<CropPhaseSolutionRequirementItemEntity> SolutionFeatures { get; set; }

        public CropPhaseSolutionRequirementEntity()
        {
        }

        public CropPhaseSolutionRequirementEntity(CropPhaseSolutionRequirementModel cropPhaseSolutionRequirementModel)
        {
            this.CopyPropertiesFrom(cropPhaseSolutionRequirementModel);
            loadFeatures(cropPhaseSolutionRequirementModel);
        }

        private void loadFeatures(CropPhaseSolutionRequirementModel cropSolutionRequirementModel)
        {

            List<CropPhaseSolutionRequirementItemEntity> cropSolutionRequirementItems = new List<CropPhaseSolutionRequirementItemEntity>();
            cropSolutionRequirementItems.Add(new CropPhaseSolutionRequirementItemEntity("HCO3", cropSolutionRequirementModel.HCO3));
            cropSolutionRequirementItems.Add(new CropPhaseSolutionRequirementItemEntity("NO3", cropSolutionRequirementModel.NO3));
            cropSolutionRequirementItems.Add(new CropPhaseSolutionRequirementItemEntity("H2PO4", cropSolutionRequirementModel.H2PO4));
            cropSolutionRequirementItems.Add(new CropPhaseSolutionRequirementItemEntity("SO4", cropSolutionRequirementModel.SO4));
            cropSolutionRequirementItems.Add(new CropPhaseSolutionRequirementItemEntity("Cl", cropSolutionRequirementModel.Cl));
            cropSolutionRequirementItems.Add(new CropPhaseSolutionRequirementItemEntity("NH4", cropSolutionRequirementModel.NH4));
            cropSolutionRequirementItems.Add(new CropPhaseSolutionRequirementItemEntity("K", cropSolutionRequirementModel.K));
            cropSolutionRequirementItems.Add(new CropPhaseSolutionRequirementItemEntity("Ca", cropSolutionRequirementModel.Ca));
            cropSolutionRequirementItems.Add(new CropPhaseSolutionRequirementItemEntity("Mg", cropSolutionRequirementModel.Mg));
            cropSolutionRequirementItems.Add(new CropPhaseSolutionRequirementItemEntity("Na", cropSolutionRequirementModel.Na));
            cropSolutionRequirementItems.Add(new CropPhaseSolutionRequirementItemEntity("Fe", cropSolutionRequirementModel.Fe));
            cropSolutionRequirementItems.Add(new CropPhaseSolutionRequirementItemEntity("B", cropSolutionRequirementModel.B));
            cropSolutionRequirementItems.Add(new CropPhaseSolutionRequirementItemEntity("Cu", cropSolutionRequirementModel.Cu));
            cropSolutionRequirementItems.Add(new CropPhaseSolutionRequirementItemEntity("Zn", cropSolutionRequirementModel.Zn));
            cropSolutionRequirementItems.Add(new CropPhaseSolutionRequirementItemEntity("Mn", cropSolutionRequirementModel.Mn));
            cropSolutionRequirementItems.Add(new CropPhaseSolutionRequirementItemEntity("Mo", cropSolutionRequirementModel.Mo));
            cropSolutionRequirementItems.Add(new CropPhaseSolutionRequirementItemEntity("N", getDerivedRequirement("NO3", cropSolutionRequirementModel.NO3, "N") + getDerivedRequirement("NH4", cropSolutionRequirementModel.NH4, "N")));
            cropSolutionRequirementItems.Add(new CropPhaseSolutionRequirementItemEntity("S", getDerivedRequirement("SO4", cropSolutionRequirementModel.SO4, "S")));
            cropSolutionRequirementItems.Add(new CropPhaseSolutionRequirementItemEntity("P", getDerivedRequirement("H2PO4", cropSolutionRequirementModel.H2PO4, "P")));
            SolutionFeatures = cropSolutionRequirementItems;
        }

        private double getDerivedRequirement(string compoundFormula, double value, string elementName)
        {
           double convertionFactor = FormulaCalculations.GetConvertionFactorFromCompoundToElement(compoundFormula, elementName);
           return value * convertionFactor;
        }


    }
}
