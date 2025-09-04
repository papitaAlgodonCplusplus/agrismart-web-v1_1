namespace Agrismart.Agronomic.UI.Services.Responses
{
    public record CropProductionDeviceResponse
    {
        public int CropProductionId { get; set; }
        public int DeviceId { get; set; }
        public DateTime StartDate { get; set; }
        public bool Active { get; set; }
    }
}
