namespace AgriSmart.AgronomicProcess.Models
{
    public record CropProduction
    {
        public int Id { get; set; }
        public ProductionUnit ProductionUnit { get; set; }  
        public int CropId { get; set; }
        public int ProductionUnitId { get; set; }
        public string? Name { get; set; }
        public int ContainerId { get; set; }
        public int DropperId { get; set; } = -1;
        public int GrowingMediumId { get; set; }
        public double Width { get; set; }
        public double Length { get; set; }
        public double BetweenRowDistance { get; set; }
        public double BetweenContainerDistance { get; set; }
        public double BetweenPlantDistance { get; set; }
        public int PlantsPerContainer { get; set; }
        public DateTime StartDate { get; set; }
        public DateTime EndDate { get; set; }
        public double WindSpeedMeasurementHeight { get; set; }
        public int Altitude { get; set; }
        public double LatitudeGrades { get; set; }
        public double LatitudeMinutes { get; set; }
        public int NumberOfDroppersPerContainer { get; set; } = 0;
        public double DepletionPercentage { get; set; }
        public double DrainThreshold { get; set; }
        public bool Active { get; set; }
        public IList<Device>? Devices { get; set; }
    }
}
