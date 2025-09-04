namespace AgriSmart.Application.Agronomic.Responses.Commands
{
    public record CreateDeviceResponse
    {
        public int Id { get; set; }
        public int CompanyId { get; set; }
        public string? DeviceId { get; set; }
        public bool Active { get; set; }
    }
}
