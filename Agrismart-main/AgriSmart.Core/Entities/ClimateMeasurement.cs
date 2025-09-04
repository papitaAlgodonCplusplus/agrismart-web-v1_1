namespace AgriSmart.Core.Entities
{
    public class ClimateMeasurement
    {
        public long Id { get; set; }
        public DateTime RecordDate { get; set; }
        public string? DeviceId { get; set; }
        public string? Variable { get; set; }
        public string? SensorLabel { get; set; }
        public float MaxValue { get; set; }
        public float MinValue { get; set; }
        public float AvgValue { get; set; }
        public float SumValue { get; set; }
        public string? UN { get; set; }
    }
}
