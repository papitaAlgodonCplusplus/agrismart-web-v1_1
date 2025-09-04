namespace Agrismart.Agronomic.UI.Services.Requests.Commands
{
    public record DeleteCropProductionDeviceRequest
    {
        public int CropProductionId { get; set; }
        public int DeviceId { get; set; }
    }
}
