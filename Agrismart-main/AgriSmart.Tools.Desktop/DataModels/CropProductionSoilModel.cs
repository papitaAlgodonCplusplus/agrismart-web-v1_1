using System;

namespace AgriSmart.Tools.DataModels
{
    public class CropProductionSoilModel : BaseModel
    {
        public int CropId { get; set; }
        public int ProductionUnitId { get; set; }
        public double Length { get; set; }
        public double Width { get; set; }
        public double BetweenRowDistance { get; set; }
        public double BetweenContainerDistance { get; set; }
        public double BetweenPlantDistance { get; set; }
        public int PlantsPerContainer { get; set; }
        public int NumberOfDroppersPerContainer { get; set; }
        public int ContainerId { get; set; }
        public int GrowingMediumId { get; set; }
        public DateTime StartDate { get; set; }
        public DateTime EndDate { get; set; }
    }
}
