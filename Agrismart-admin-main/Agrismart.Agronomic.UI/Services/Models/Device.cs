namespace Agrismart.Agronomic.UI.Services.Models
{
    public record Device
    {
        public int Id { get; set; }
        public int CompanyId { get; set; }
        public string? DeviceId { get; set; }
        public bool Active { get; set; }
        public DateTime? DateCreated { get; set; }
        public DateTime? DateUpdated { get; set; }
        public int? CreatedBy { get; set; }
        public int? UpdatedBy { get; set; }
    }
}