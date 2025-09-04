namespace AgriSmart.Core.Entities
{
    public class GrowingMedium : BaseEntity
    {
        public int CatalogId { get; set; }
        public string? Name { get; set; }
        public double ContainerCapacityPercentage { get; set; }
        public double PermanentWiltingPoint { get; set; }
        public double FiveKpaHumidity { get; set; }
        public bool Active { get; set; }
    }
}