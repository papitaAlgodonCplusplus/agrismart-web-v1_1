using AgriSmart.Calculator.Models;

namespace AgriSmart.Calculator.Entities
{
    public class GrowingMediumEntity
    {
        public int Id { get; set; }
        public int CatalogId { get; set; }
        public string? Name { get; set; }
        public double ContainerCapacityPercentage { get; set; }
        public double PermanentWiltingPoint { get; set; }
        public double FiveKpaHumidity { get; set; } = 10;//not in DB
        public bool Active { get; set; }
        public double TotalAvailableWaterPercentage { get { return getTotalAvailableWaterPercentage(); } }
        public double EaselyAvailableWaterPercentage { get { return getEaselyAvailableWaterPercentage(); } }
        public double ReserveWaterPercentage { get { return getReserveWaterPercentage(); } }

        public GrowingMediumEntity(GrowingMedium model)
        {
            this.CopyPropertiesFrom(model);
        }

        private double getTotalAvailableWaterPercentage()
        {
            return ContainerCapacityPercentage - PermanentWiltingPoint;
        }

        private double getEaselyAvailableWaterPercentage()
        {
            return ContainerCapacityPercentage - FiveKpaHumidity;
        }

        private double getReserveWaterPercentage()
        {
            return EaselyAvailableWaterPercentage - PermanentWiltingPoint;
        }
    }
}

