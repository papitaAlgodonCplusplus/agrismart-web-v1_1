namespace AgriSmart.Core.Entities
{
    public class Dropper : BaseEntity
    {
        public int CatalogId { get; set; }
        public string? Name { get; set; }
        public double FlowRate { get; set; }
        public bool? Active { get; set; }
    }
}