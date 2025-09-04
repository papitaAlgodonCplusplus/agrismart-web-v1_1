namespace AgriSmart.Application.Agronomic.Responses.Commands
{
    public record DeleteCropProductionDeviceResponse
    {
        public int CropProductionId { get; set; }
        public int DeviceId { get; set; }
    }
}
