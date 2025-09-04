using AgriSmart.AgronomicProcess.Models;


namespace AgriSmart.AgronomicProcess.Entities
{
    public class CropProductionEntity
    {
        public int Id { get; set; }
        public CropEntity Crop { get; set; }
        public ProductionUnitEntity ProductionUnit { get; set; }
        public double Area { get { return getArea(); } }
        public ContainerEntity Container { get; set; }
        public DropperEntity Dropper { get; set; }
        public int NumberOfDroppersPerContainer { get; set; }
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
        public double DepletionPercentage { get; set; }//not in database
        public double DrainThreshold { get; set; }//not in database
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
