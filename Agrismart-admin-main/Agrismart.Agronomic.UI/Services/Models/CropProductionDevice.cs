namespace Agrismart.Agronomic.UI.Services.Models
{
    public record CropProductionDevice
    {
        public int CropProductionId { get; set; }
        public int DeviceId {  get; set; }
        public bool Active { get; set; }
        public DateTime? DateCreated { get; set; }
        public DateTime? DateUpdated { get; set; }
        public int? CreatedBy { get; set; }
        public int? UpdatedBy { get; set; }
    }
}