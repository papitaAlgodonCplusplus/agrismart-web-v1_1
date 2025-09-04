using AgriSmart.Tools.DataModels;
using static AgriSmart.Tools.Common.Enums;

namespace AgriSmart.Tools.Entities
{
    public class SoilLayerEntity : BaseEntity
    {
        public int CatalogsId { get; set; }
        public double FieldCapacityPercentage { get; set; }
        public double PermanentWiltingPointPercentage { get; set; }
        public double SevenKpaHumidity { get; set; }
        public double ApparentDensity { get; set; }
        public double ActualDensity { get; set; }
        public double SoilDepth {  get; set; }
        public double SandPercentage { get; set; }
        public double SiltPercentage { get; set; }
        public double ClayPercentage { get; set; }
        public double InfiltrationCapacity { get; set; }
        public double DepletionPercentage { get; set; }
        public double IrrigatedAreaPercentage { get; set; }
        public double IrrigationSheetNetVolume { get; set; }
        public double ApplicationEfficiency { get; set; }
        public Common.Enums.Texture Texture { get { return getTexture(); } }
        public double TotalPorosityPercentage { get { return getTotalPorosityPercentage(); } }
        public double TotalPorosityVolume { get { return getTotalPorosityVolume(); } }
        public double SolidComponentPercentage { get { return getSolidComponentPercentage(); } }
        public double SolidComponentVolume { get { return getSolidComponentVolume(); } }
        public double EaselyAvaliableWaterPercentage { get { return getEaselyAvaliableWaterPercentage(); } }
        public double EaselyAvailableWaterVolumen { get { return getEaselyAvailableWaterVolume(); } }
        public double TotalAvailableWaterPercentage { get { return getTotalAvailableWaterPercentage(); }}
        public double TotalAvailableWaterVolume { get { return getTotalAvailableWaterVolumen(); } }
        public double ReserveWaterPercentage { get { return getReserveWaterPercentage(); } }
        public double ReserveWaterVolumen { get { return getReserveWaterVolumen(); } }
        public double NonAvailableWaterPercentage { get { return getNonAvailableWaterPercentage(); } }
        public double NonAvailableWaterVolume { get { return getNonAvailableWaterVolumen(); } }
        public double AerationCapacityAtContainerCapacityPercentage { get { return getAerationCapacityAtContainerCapacityPercentage(); } }
        public double AerationCapacityAtContainerCapacityVolume { get { return getAerationCapacityAtContainerCapacityVolumen(); } }
        public double IrrigationSheetTotalVolume { get { return getIrrigationSheetTotalVolume(); } }

        public SoilLayerEntity()
        {
        }

        public SoilLayerEntity(SoilLayerModel model)
        {
            this.CopyPropertiesFrom(model);
        }

        private double getTotalPorosityPercentage()
        {
            return (1 - (ApparentDensity / ActualDensity)) * 100;
        }
        private double getTotalPorosityVolume()
        {
            return (TotalPorosityPercentage / 100) * (SoilDepth);
        }
        private double getSolidComponentPercentage()
        {
            return 100 - TotalPorosityPercentage;
        }
        private double getSolidComponentVolume()
        {
            return SolidComponentPercentage / 100 * (SoilDepth);
        }
        private double getEaselyAvaliableWaterPercentage()
        {
            return FieldCapacityPercentage - SevenKpaHumidity;
        }
        private double getEaselyAvailableWaterVolume()
        {
            return (EaselyAvaliableWaterPercentage / 100) * (SoilDepth);
        }
        private double getReserveWaterPercentage()
        {
            return SevenKpaHumidity - PermanentWiltingPointPercentage;
        }
        private double getReserveWaterVolumen()
        {
            return (ReserveWaterPercentage / 100) * (SoilDepth);
        }
        private double getTotalAvailableWaterPercentage()
        {
            return FieldCapacityPercentage - PermanentWiltingPointPercentage;
        }
        private double getTotalAvailableWaterVolumen()
        {
            return EaselyAvailableWaterVolumen + ReserveWaterVolumen;
        }
        private double getNonAvailableWaterPercentage()
        {
            return FieldCapacityPercentage - TotalAvailableWaterPercentage;
        }
        private double getNonAvailableWaterVolumen()
        {
            return (NonAvailableWaterPercentage / 100) * (SoilDepth);
        }
        private double getAerationCapacityAtContainerCapacityPercentage()
        {
            return TotalPorosityPercentage - FieldCapacityPercentage;
        }
        private double getAerationCapacityAtContainerCapacityVolumen()
        {
            return TotalPorosityVolume - (FieldCapacityPercentage / 100) * (SoilDepth);
        }
        private double getIrrigationSheetTotalVolume()
        {
            return TotalAvailableWaterVolume * SoilDepth;
        }
        private double getIrrigationNetSheetVolume()
        {
            return IrrigationSheetTotalVolume * (DepletionPercentage /100) * (IrrigatedAreaPercentage / 100);
        }
        private double getTotalAvailableWaterVolume() {
            return 0;
        }
        private Texture getTexture()
        {

            if (ClayPercentage >= 40 && SiltPercentage < 40 && SandPercentage < 45)
            {
                return Texture.Clay;
            }
            else if (ClayPercentage >= 27 && ClayPercentage < 40 && SiltPercentage >= 28 && SiltPercentage < 50 && SandPercentage <= 45)
            {
                return Texture.ClayLoam;
            }
            else if (ClayPercentage >= 27 && ClayPercentage < 40 && SiltPercentage < 28 && SandPercentage > 45)
            {
                return Texture.SandyClayLoam;
            }
            else if (ClayPercentage >= 20 && ClayPercentage < 35 && SiltPercentage > 50 && SandPercentage < 20)
            {
                return Texture.SiltyClayLoam;
            }
            else if (ClayPercentage >= 35 && SandPercentage >= 45)
            {
                return Texture.SandyClay;
            }
            else if (ClayPercentage >= 40 && SiltPercentage >= 40)
            {
                return Texture.SiltyClay;
            }
            else if (SiltPercentage >= 50 && SandPercentage <= 20)
            {
                return Texture.Silt;
            }
            else if (SiltPercentage >= 50 && SandPercentage > 20)
            {
                return Texture.SiltLoam;
            }
            else if (SandPercentage >= 85 && ClayPercentage < 10)
            {
                return Texture.Sand;
            }
            else if (SandPercentage >= 70 && SandPercentage < 85 && ClayPercentage < 20)
            {
                return Texture.LoamySand;
            }
            else if (SandPercentage >= 45 && SandPercentage < 70 && SiltPercentage >= 15 && SiltPercentage < 50 && ClayPercentage >= 10 && ClayPercentage < 27)
            {
                return Texture.SandyLoam;
            }
            else if (SandPercentage >= 20 && SandPercentage < 45 && SiltPercentage >= 15 && SiltPercentage < 50 && ClayPercentage >= 10 && ClayPercentage < 27)
            {
                return Texture.Loam;
            }
            else
                return Texture.UnClassified;
        }
    }
}
