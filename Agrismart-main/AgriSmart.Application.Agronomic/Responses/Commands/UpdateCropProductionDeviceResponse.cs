namespace AgriSmart.Application.Agronomic.Responses.Commands
{
    public record UpdateCropProductionDeviceResponse
    {
        public int Id { get; set; }
        public int CropProductionId { get; set; }
        public int DeviceId { get; set; }
        DateTime? InitDate { get; set; }
    }
}
