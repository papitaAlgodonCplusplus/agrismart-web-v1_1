namespace AgriSmart.OnDemandIrrigation.Models
{
    public class GrowingMedium
    {
        public int Id {  get; set; }
        public int CatalogId { get; set; }
        public string? Name { get; set; }
        public double ContainerCapacityPercentage { get; set; }
        public double PermanentWiltingPoint { get; set; }
        public double FiveKpaHumidity { get; set; }
        public double EaselyAvailableWaterPercentage { get; set; }
        public double ReserveWaterPercentage { get; set; }
        public double TotalAvailableWaterPercentage { get; set; }
        public bool Active { get; set; }
    }
}