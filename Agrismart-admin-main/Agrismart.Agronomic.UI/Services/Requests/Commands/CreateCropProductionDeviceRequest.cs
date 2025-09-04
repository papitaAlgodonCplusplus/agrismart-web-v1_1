namespace Agrismart.Agronomic.UI.Services.Requests.Commands
{
    public record CreateCropProductionDeviceRequest
    {
        public int CropProductionId { get; set; }
        public int DeviceId { get; set; }
        public DateTime StartDate { get; set; }
    }
}
