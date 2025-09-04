using AgriSmart.Core.Entities;

namespace AgriSmart.Tools.Entities
{
    public class GrowingMediumEntity : BaseEntity
    {
        public int CatalogsId { get; set; }
        public double ContainerCapacityPercentage { get; set; }
        public double PermanentWiltingPointPercentage { get; set; }
        public double FiveKpaHumidity { get; set;}
        public double ApparentDensity { get; set; }
        public double ActualDensity { get; set; }
        public double DepletionPercentage { get; set; }
        public double TotalAvailableWaterPercentage { get { return getTotalAvailableWaterPercentage(); } }
        public double EaselyAvaliableWaterPercentage { get { return getEaselyAvaliableWaterPercentage(); } }
        public double ReserveWaterPercentage { get { return getReserveWaterPercentage(); } }
        public double TotalPorosityPercentage { get { return getTotalPorosityPercentage(); } }
        public double SolidComponent { get { return getSolidComponent(); } }
        public double NonAvailableWaterPercentage { get { return getNonAvailableWaterPercentage(); } }
        public double AerationCapacityAtContainerCapacityPercentage { get { return getAerationCapacityAtContainerCapacityPercentage(); } }

        public GrowingMediumEntity()
        {

        }

        public GrowingMediumEntity(GrowingMedium model)
        {
            Id = model.Id;
            Name = model.Name;
            CatalogsId = model.CatalogId;
            ContainerCapacityPercentage = model.ContainerCapacityPercentage;
            PermanentWiltingPointPercentage = model.PermanentWiltingPoint;
            FiveKpaHumidity = model.FiveKpaHumidity;

        }

        public GrowingMediumEntity(int id, string name, int catalogsId, double containerCapacityPercentage, double permanentWiltingPoint, double fiveKpaHumidity)
        {
            Id = id;
            Name = name;
            CatalogsId = catalogsId;
            ContainerCapacityPercentage = containerCapacityPercentage;
            PermanentWiltingPointPercentage = permanentWiltingPoint;
            FiveKpaHumidity = fiveKpaHumidity;

        }

        private double getTotalAvailableWaterPercentage()
        {
            return ContainerCapacityPercentage - PermanentWiltingPointPercentage;
        }

        private double getEaselyAvaliableWaterPercentage()
        {
            return ContainerCapacityPercentage - FiveKpaHumidity;
        }

        private double getReserveWaterPercentage()
        {
            return FiveKpaHumidity - PermanentWiltingPointPercentage;
        }

        private double getTotalPorosityPercentage()
        {
            return (1 - (ApparentDensity / ActualDensity)) * 100;
        }

        private double getSolidComponent()
        {
            return 100 - TotalPorosityPercentage;
        }

        private double getNonAvailableWaterPercentage()
        {
            return ContainerCapacityPercentage - TotalAvailableWaterPercentage;
        }

        private double getAerationCapacityAtContainerCapacityPercentage()
        {
            return TotalPorosityPercentage - ContainerCapacityPercentage;
        }
    }
}
