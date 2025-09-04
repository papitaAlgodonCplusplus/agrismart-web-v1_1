namespace Agrismart.Agronomic.UI.Services.Responses
{
    public record CropProductionIrrigationSectorResponse
    {
        public int Id { get; set; }
        public int CropProductionId { get; set; }
        public string? Name { get; set; }
        public string Polygon { get; set; }
        public bool Active { get; set; }
    }
}
