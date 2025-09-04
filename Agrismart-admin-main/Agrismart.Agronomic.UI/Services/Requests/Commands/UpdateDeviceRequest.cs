namespace Agrismart.Agronomic.UI.Services.Requests.Commands
{
    public record UpdateDeviceRequest
    {
        public int Id { get; set; }
        public int CompanyId { get; set; }
        public string? DeviceId { get; set; }
        public bool Active { get; set; }
    }
}
