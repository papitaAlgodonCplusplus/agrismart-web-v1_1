namespace AgriSmart.Core.Entities
{
    public class AnalyticalEntity : BaseEntity
    {
        public int Id { get; set; }
        public int CatalogId { get; set; }       
        public string? Name { get; set; }
        public string? Description { get; set; }
        public string? Script { get; set; }
        public int EntityType { get; set; }
        public bool? Active { get; set; }
    }
}