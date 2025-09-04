namespace AgriSmart.Tools.Entities
{
    public class CropPhaseOptimalEntity:BaseEntity
    {
        public string Name { get; set; }
        public string CalculationOutput { get; set; }
        public double MinValue { get; set; }
        public double CriticMinValue { get; set; }
        public double MaxValue { get; set; }
        public double CriticMaxValue { get; set; }
    }
}
