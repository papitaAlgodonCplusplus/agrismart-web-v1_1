namespace AgriSmart.Tools.DataModels
{
    public class CropPhaseSolutionRequirementModel: BaseModel
    {
        public int PhaseId { get; set; }
        public double EC { get; set; } // electrical conductivity
        public double HCO3 { get; set; } //bicarbonate
        public double NO3 { get; set; } // nitrate
        public double H2PO4 { get; set; } //phosphate
        public double SO4 { get; set; } //sulphate
        public double Cl { get; set; } //chlorine
        public double NH4 { get; set; } //ammonium
        public double K { get; set; } //potassium
        public double Ca { get; set; } //calcium
        public double Mg { get; set; } //magnesium
        public double Na { get; set; } //sodium
        public double Fe { get; set; } //iron
        public double B { get; set; } //boron
        public double Cu { get; set; } //copper
        public double Zn { get; set; } //zinc
        public double Mn { get; set; } //manganese
        public double Mo { get; set; } //molybdenum
        public double N { get; set; } //Nitrogen
        public double S { get; set; } //Nitrogen
        public double P { get; set; } //Nitrogen
        public bool Active { get; set; }

    }
}
