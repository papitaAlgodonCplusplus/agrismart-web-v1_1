using AgriSmart.OnDemandIrrigation.Models;

namespace AgriSmart.OnDemandIrrigation.Entities
{
    public class CropProductionEntity
    {
        public int Id { get; set; }
        public int CropId { get; set; }
        public int ProductionUnitId { get; set; }
        public string? Name { get; set; }
        public ContainerEntity? Container { get; set; }
        public GrowingMediumEntity? GrowingMedium { get; set; }
        public Dropper? Dropper { get; set; }//not in database
        public double Width { get; set; }
        public double Length { get; set; }
        public double BetweenRowDistance { get; set; }
        public double BetweenContainerDistance { get; set; }
        public double BetweenPlantDistance { get; set; }
        public int PlantsPerContainer { get; set; }
        public int NumberOfDroppersPerContainer { get; set; }//not in database
        public DateTime StartDate { get; set; }
        public DateTime EndDate { get; set; }
        public double WindSpeedMeasurementHeight { get; set; }
        public int Altitude { get; set; }
        public double LatitudeGrades { get; set; }
        public double LatitudeMinutes { get; set; }
        public double DepletionPercentage { get; set; }//not in database
        public double DrainThreshold { get; set; }//not in database
        public bool Active { get; set; }
        public Crop? Crop { get; set; }
        public ProductionUnit? ProductionUnit { get; set; }

        public CropProductionEntity(CropProduction model)
        {
            this.CopyPropertiesFrom(model);
        }
    }
}