namespace AgriSmart.Application.Agronomic.Responses.Commands
{
    public record UpdateDeviceResponse
    {
        public int Id { get; set; }
        public int CompanyId { get; set; }
        public string? DeviceId { get; set; }
        public bool? Active { get; set; }
    }
}
