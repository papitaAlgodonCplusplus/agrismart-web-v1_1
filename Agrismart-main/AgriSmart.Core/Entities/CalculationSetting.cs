namespace AgriSmart.Core.Entities
{
    public class CalculationSetting : BaseEntity
    {
        public int CatalogId { get; set; }
        public string? Name { get; set; }
        public double Value { get; set; }
        public bool? Active { get; set; }
    }
}