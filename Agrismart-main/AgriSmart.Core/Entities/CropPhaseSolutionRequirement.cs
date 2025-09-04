namespace AgriSmart.Core.Entities
{
    public class CropPhaseSolutionRequirement : BaseEntity
    {
        public int PhaseId { get; set; }
        public double EC { get; set; }
        public double HCO3 { get; set; }
        public double NO3 { get; set; }
        public double H2PO4 { get; set; }
        public double SO4 { get; set; }
        public double Cl { get; set; }
        public double NH4 { get; set; }
        public double K { get; set; }
        public double Ca { get; set; }
        public double Mg { get; set; }
        public double Na { get; set; }
        public double Fe { get; set; }
        public double B { get; set; }
        public double Cu { get; set; }
        public double Zn { get; set; }
        public double Mn { get; set; }
        public double Mo { get; set; }
        public double N { get; set; }
        public double S { get; set; }
        public double P { get; set; }
        public bool Active { get; set; }
    }
}