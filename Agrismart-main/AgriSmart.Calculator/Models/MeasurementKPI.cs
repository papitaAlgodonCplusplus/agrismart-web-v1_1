namespace AgriSmart.Calculator.Models
{
    public record MeasurementKPI
    {
        public int Id { get; set; }
        public DateTime RecordDate { get; set; }
        public int CropProductionId { get; set; }
        public int KPIId { get; set; }
        public double MinValue { get; set; }
        public double MaxValue { get; set; }
        public double AvgValue { get; set; }
        public double? SumValue { get; set; }
    }
}