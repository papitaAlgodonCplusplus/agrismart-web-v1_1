namespace AgriSmart.OnDemandIrrigation.Models
{
    public class Dropper
    {
        public int CatalogId { get; set; }
        public string? Name { get; set; }
        public double  FlowRate { get; set; }
        public bool Active { get; set; }
    }
}