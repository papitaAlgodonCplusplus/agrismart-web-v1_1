namespace Agrismart.Agronomic.UI.Services.Responses
{
    public record CropProductionResponse
    {
        public int Id { get; set; }
        public int CropId { get; set; }
        public int ProductionUnitId { get; set; }
        public string? Name { get; set; }
        public int ContainerId { get; set; }
        public int GrowingMediumId { get; set; }
        public double Width { get; set; }
        public double Length { get; set; }
        public double BetweenRowDistance { get; set; }
        public double BetweenContainerDistance { get; set; }
        public DateTime StartDate { get; set; }
        public DateTime EndDate { get; set; }
        public bool Active { get; set; }
    }
}
