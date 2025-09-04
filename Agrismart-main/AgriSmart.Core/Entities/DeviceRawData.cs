namespace AgriSmart.Core.Entities
{
    public class DeviceRawData
    {
        public int Id { get; set; }
        public DateTime? RecordDate { get; set; }
        public string? ClientId { get; set; }
        public string? UserId { get; set; }
        public string? DeviceId { get; set; }
        public string? Sensor { get; set; }
        public string? Payload { get; set; }
    }
}
