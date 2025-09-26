namespace AgriSmart.Core.Entities
{
    public class CropPhaseOptimal : BaseEntity
    {
        public int CatalogId { get; set; }
        public string? Name { get; set; }
        public string? Description { get; set; }
        public double Value { get; set; }
        public bool? Active { get; set; }
    }
}