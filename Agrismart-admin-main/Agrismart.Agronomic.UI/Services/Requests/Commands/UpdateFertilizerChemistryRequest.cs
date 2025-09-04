namespace Agrismart.Agronomic.UI.Services.Requests.Commands
{
    public record UpdateFertilizerChemistryRequest
    {
        public int Id { get; set; }
        public int FertilizerId { get; set; }
        public double Purity { get; set; }
        public double Density { get; set; }
        public double Solubility0 { get; set; }
        public double Solubility20 { get; set; }
        public double Solubility40 { get; set; }
        public string? Formula { get; set; }
        public int Valence { get; set; }
        public bool IsPhAdjuster { get; set; }
        public bool Active { get; set; }
    }
}