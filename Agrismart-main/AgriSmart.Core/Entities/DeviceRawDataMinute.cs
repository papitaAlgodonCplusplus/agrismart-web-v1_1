namespace AgriSmart.Core.Entities
{
    public class DeviceRawDataMinute
    {
        public long Id { get; set; }
        public DateTime? RecordDate { get; set; }
        public string? ClientId { get; set; }
        public string? UserId { get; set; }
        public string? DeviceId { get; set; }
        public string? Sensor { get; set; }
        public decimal? Payload_Avg { get; set; }
        public decimal? Payload_Min { get; set; }
        public decimal? Payload_Max { get; set; }
        public string? Payload_Last { get; set; }
        public int? RecordCount { get; set; }
        public int? Summarized { get; set; }
    }
}
