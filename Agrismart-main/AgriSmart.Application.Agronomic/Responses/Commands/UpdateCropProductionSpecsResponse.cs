namespace AgriSmart.Application.Agronomic.Responses.Commands
{
    public record UpdateCropProductionSpecsResponse
    {
        public int Id { get; set; }
        public string Name { get; set; }
        public string? Description { get; set; }
        public decimal BetweenRowDistance { get; set; }
        public decimal BetweenContainerDistance { get; set; }
        public decimal BetweenPlantDistance { get; set; }
        public decimal Area { get; set; }
        public decimal ContainerVolume { get; set; }
        public decimal AvailableWaterPercentage { get; set; }
        public bool Active { get; set; }
    }
}
