namespace AgriSmart.Application.Agronomic.Responses.Commands
{
    public record CreateCropProductionDeviceResponse
    {
        public int CropProductionId { get; set; }
        public int DeviceId { get; set; }
        public DateTime? StartDate { get; set; }
        public bool? Active { get; set; }
    }
}
