namespace AgriSmart.Core.DTOs
{
    public class AggregatedDeviceData
    {
        public DateTime Timestamp { get; set; }
        public string DeviceId { get; set; } = string.Empty;
        public string Sensor { get; set; } = string.Empty;
        public decimal Value { get; set; }
        public decimal? MinValue { get; set; }
        public decimal? MaxValue { get; set; }
        public int DataPointCount { get; set; }
    }
}
