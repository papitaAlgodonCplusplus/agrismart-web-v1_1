namespace AgriSmart.Tools.Entities
{
    public class FertilizerChemistryEntity: BaseEntity
    {
        public int FertilizerId { get; set; }

        private double _purity;
        public double Purity { get => _purity; set { _purity = value; OnPropertyChanged(); } }

        private double _density;
        public double Density { get => _density; set { _density = value; OnPropertyChanged(); } }

        private double _solubility0;
        public double Solubility0 { get => _solubility0; set { _density = value; OnPropertyChanged(); } }

        private double _solubility20;
        public double Solubility20 { get => _solubility20; set { _solubility20 = value; OnPropertyChanged(); } }

        private double _solubility40;
        public double Solubility40 { get => _solubility40; set { _solubility40 = value; OnPropertyChanged(); } }

        private int _valence;
        public int Valence { get => _valence; set { _valence = value; OnPropertyChanged(); } }

        private bool _ispHAdjuster;
        public bool IspHAdjuster { get => _ispHAdjuster; set { _ispHAdjuster = value; OnPropertyChanged(); } }

        private string _formula;
        public string Formula { get => _formula; set { _formula = value; OnPropertyChanged(); } }

        public FertilizerChemistryEntity()
        {
        }

        public FertilizerChemistryEntity(DataModels.FertilizerChemistryModel chemistryModel)
        {
            this.CopyPropertiesFrom(chemistryModel);
        }

        public FertilizerChemistryEntity(int id, int fertilizerId, double purity, double density, double solubility0, double solubility20, double solubility40, int valence, bool ispHAdjuster, string formula)
        {
            Id = id;
            FertilizerId = fertilizerId;
            Purity = purity;
            Density = density;
            Solubility0 = solubility0;
            Solubility20 = solubility20;
            Solubility40 = solubility40;
            Valence = valence;
            IspHAdjuster = ispHAdjuster;
            Formula = formula;
        }
    }
}
