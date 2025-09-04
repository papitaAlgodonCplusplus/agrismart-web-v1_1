using AgriSmart.Tools.Entities;

namespace AgriSmart.Tools.Logic
{
    public class IrrigationDesignCalculationsForCropProductionGrowingMedium
    {
        CropProductionGrowingMediumEntity input;
        public double TotalPorosityPercentage { get { return input.GrowingMedium.TotalPorosityPercentage; } }
        public double TotalPorosityVolume { get { return getTotalPorosityVolume(); } }
        public double SolidComponent { get { return input.GrowingMedium.SolidComponent; } }
        public double EaselyAvailableWaterPercentage { get { return input.GrowingMedium.EaselyAvaliableWaterPercentage; } }
        public double EaselyAvailableWaterVolumen { get { return getEaselyAvailableWaterVolume(); } }
        public double ReserveWaterPercentage { get { return input.GrowingMedium.ReserveWaterPercentage; } }
        public double ReserveWaterVolumen { get { return getReserveWaterVolumen(); } }
        public double TotalAvailableWaterPercentage { get { return input.GrowingMedium.TotalAvailableWaterPercentage; } }
        public double TotalAvailableWaterVolume { get { return getTotalAvailableWaterVolumen(); } }
        public double NonAvailableWaterPercentage { get { return input.GrowingMedium.NonAvailableWaterPercentage; } }
        public double NonAvailableWaterVolume { get { return getTotalAvailableWaterVolumen(); } }
        public double AerationCapacityAtContainerCapacityPercentage { get { return input.GrowingMedium.AerationCapacityAtContainerCapacityPercentage; } }
        public double AerationCapacityAtContainerCapacityVolume { get { return getAerationCapacityAtContainerCapacityVolumen(); } }

        public IrrigationDesignCalculationsForCropProductionGrowingMedium(CropProductionGrowingMediumEntity input)
        {
            this.input = input;
        }

        private double getTotalPorosityVolume()
        {
            return (TotalPorosityPercentage / 100) * input.Container.Volume.Value;
        }
        private double getEaselyAvailableWaterVolume()
        {
            return (EaselyAvailableWaterPercentage / 100) * input.Container.Volume.Value;
        }
        private double getReserveWaterVolumen()
        {
            return (ReserveWaterPercentage / 100) * input.Container.Volume.Value;
        }
        private double getTotalAvailableWaterVolumen()
        {
            return EaselyAvailableWaterVolumen + ReserveWaterVolumen;
        }
        private double getNonAvailableWaterVolumen()
        {
            return ((input.GrowingMedium.ContainerCapacityPercentage / 100) * input.Container.Volume.Value) - TotalAvailableWaterVolume;
        }
        private double getAerationCapacityAtContainerCapacityVolumen()
        {
            return TotalPorosityVolume - ((input.GrowingMedium.ContainerCapacityPercentage / 100) * input.Container.Volume.Value);

        }


    }
}
