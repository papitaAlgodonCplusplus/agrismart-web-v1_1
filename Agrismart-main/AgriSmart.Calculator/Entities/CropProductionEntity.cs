using AgriSmart.Calculator.Entities.Base;
using AgriSmart.Calculator.Models;

namespace AgriSmart.Calculator.Entities
{
    public class CropProductionEntity: BaseCalculationEntity
    {
        public Crop Crop { get; set; }
        public ProductionUnit ProductionUnit { get; set; }
        public double Area { get { return getArea(); } }
        public ContainerEntity Container { get; set; }
        public Dropper Dropper { get; set; }
        public int NumberOfDropperPerContainer { get; set; }
        public GrowingMediumEntity GrowingMedium { get; set; }
        public double Width { get; set; }
        public double Length { get; set; }
        public double BetweenRowDistance { get; set; }
        public double BetweenContainerDistance { get; set; }
        public double BetweenPlantDistance { get; set; }
        public double WindSpeedMeasurementHeight { get; set; }
        public int Altitude { get; set; }
        public double LatitudeGrades { get; set; }
        public double LatitudeMinutes { get; set; }
        public DateTime StartDate { get; set; }
        public DateTime EndDate { get; set; }
        public List<CropProductionIrrigationSector> IrrigationSector { get; set; }


        public CropProductionEntity(CropProduction model)
        {
            this.CopyPropertiesFrom(model);
        }


        private double getArea()
        {
            return Length * Width;
        }
    }
}
