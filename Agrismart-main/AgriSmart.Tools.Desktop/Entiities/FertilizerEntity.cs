using AgriSmart.Tools.Common;
using AgriSmart.Tools.DataModels;
using System.Collections.Generic;

namespace AgriSmart.Tools.Entities
{
    public class FertilizerEntity : BaseEntity
    {
        public int CatalogId { get; set; }

        private string _manufacturer;
        public string Manufacturer { get => _manufacturer; set { _manufacturer = value; OnPropertyChanged(); } }
        public FertilizerInputEntity FertilizerInput { get; set; }
        
        private int _fertilizerChemistryId;
        public int FertilizerChemistryId { get => _fertilizerChemistryId; set { _fertilizerChemistryId = value; OnPropertyChanged(); } }

        public FertilizerChemistryEntity FertilizerChemistry;

        private bool _isLiquid;
        public bool IsLiquid { get => _isLiquid; set { _isLiquid = value; OnPropertyChanged(); } }
        public bool Selected { get; set; } = false;
        public double Amount { get; set; } = 0;
        public FertilizerEntity(FertilizerModel model, FertilizerChemistryEntity fertilizerChemistry)
        {
            this.CopyPropertiesFrom(model);
            FertilizerChemistry = fertilizerChemistry;
        }
        public double SaltMolecularWeight
        {
            get
            {
                return getMolecularWeight(FertilizerChemistry.Formula);
            }
        }
        public double CationMolecularWeight
        {
            get
            {
                return 0;//getMolecularWeight(FertilizerChemistry.CationFormula);
            }
        }
        public double AnionMolecularWeight
        {
            get
            {
                return 0; //getMolecularWeight(FertilizerChemistry.AnionFormula);
            }
        }
        public double Pnh4
        {
            get
            {
                return 0;
                //return CationMolecularWeight / SaltMolecularWeight;
                //return getNCompound( / SaltMolecularWeight;
            }
        }
        public double Pn
        {
            get
            {

                double nMW = 0;
                Constants.MolecularWeightDic.TryGetValue("N", out nMW);

                double cf = nMW / CationMolecularWeight;

                return CationMolecularWeight * cf;
            }
        }
        public double Pno3
        {
            get
            {
                double nMW = 0;
                Constants.MolecularWeightDic.TryGetValue("N", out nMW);

                double cf = nMW / AnionMolecularWeight;

                return AnionMolecularWeight * cf;
            }
        }
        private double getMolecularWeight(string formula)
        {
            return FormulaCalculations.getMolecularWeight(formula);
        }
        public List<FertlizerFeatureEntity> Features { get; set; }
    }
}
