namespace AgriSmart.Core.Entities
{
    public class Fertilizer : BaseEntity
    {
        public int CatalogId { get; set; }       
        public string? Name { get; set; }
        public string? Manufacturer { get; set; }
        public bool IsLiquid { get; set; }
        public bool Active { get; set; }
    }
}