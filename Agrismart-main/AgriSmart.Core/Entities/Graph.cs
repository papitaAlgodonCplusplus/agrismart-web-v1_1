namespace AgriSmart.Core.Entities
{
    public class Graph : BaseEntity
    {
        public int Id { get; set; }
        public int CatalogId { get; set; }       
        public string? Name { get; set; }
        public string? Description { get; set; }
        public string? SummaryTimeScale { get; set; }
        public string? YAxisScaleType { get; set; }
        public string? Series { get; set; }
        public bool? Active { get; set; }
    }
}