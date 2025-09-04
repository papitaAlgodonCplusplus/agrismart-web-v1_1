namespace AgriSmart.Core.Entities
{
    public class Company : BaseEntity
    {
        public int ClientId { get; set; }
        public int CatalogId { get; set; }
        public string? Name { get; set; }
        public string? Description { get; set; }
        public bool Active { get; set; }
    }
}