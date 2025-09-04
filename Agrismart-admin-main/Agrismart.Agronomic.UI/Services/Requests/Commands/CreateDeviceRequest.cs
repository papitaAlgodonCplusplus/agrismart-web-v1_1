namespace Agrismart.Agronomic.UI.Services.Requests.Commands
{
    public record CreateDeviceRequest
    {
        public int CompanyId { get; set; }
        public string? DeviceId { get; set; }
    }
}
