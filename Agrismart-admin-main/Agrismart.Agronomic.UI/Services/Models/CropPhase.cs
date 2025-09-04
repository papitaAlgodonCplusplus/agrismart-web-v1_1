namespace Agrismart.Agronomic.UI.Services.Models
{
    public record CropPhase
    {
        public int Id { get; set; }
        public int CropId { get; set; }
        public int CatalogId { get; set; }
        public string? Name { get; set; }
        public string? Description { get; set; }
        public int? Sequence { get; set; }
        public int? StartingWeek { get; set; }
        public int? EndingWeek { get; set; }
        public bool Active { get; set; }
        public DateTime? DateCreated { get; set; }
        public DateTime? DateUpdated { get; set; }
        public int? CreatedBy { get; set; }
        public int? UpdatedBy { get; set; }
    }
}