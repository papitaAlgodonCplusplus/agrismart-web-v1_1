using AgriSmart.Tools.DataModels;
using AgriSmart.Tools.Entities;

namespace AgriSmart.Tools.DataModels
{
    public class FertilizerChemistryModel: BaseModel
    {
        public int FertilizerId { get; set; }
        public double Purity { get; set; }
        public double Density { get; set; }
        public double Solubility0 { get; set; }
        public double Solubility20 { get; set; }
        public double Solubility40 { get; set; }
        public int Valence { get; set; }
        public bool IspHAdjuster { get; set; }
        public string Formula { get; set; }

        public FertilizerChemistryModel()
        {
        }

        public FertilizerChemistryModel(FertilizerChemistryEntity model)
        {
            this.CopyPropertiesFrom(model);
        }

    }
}
