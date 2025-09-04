namespace AgriSmart.AgronomicProcess.Models
{
    public record Device
    {
        public int Id { get; set; }
        public int CompanyId { get; set; }
        public string? DeviceId { get; set; }
        public bool Active { get; set; }
    }
}
