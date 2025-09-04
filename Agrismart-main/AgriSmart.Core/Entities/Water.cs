namespace AgriSmart.Core.Entities
{
    public class Water : BaseEntity
    {
        public int CatalogId { get; set; }       
        public string? Name { get; set; }
        public bool Active { get; set; }
    }
}