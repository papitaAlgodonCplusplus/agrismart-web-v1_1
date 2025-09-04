namespace Agrismart.Agronomic.UI.Services.Requests.Commands
{
    public record UpdateCropProductionIrrigationSectorRequest
    {
        public int Id { get; set; }
        public int CropProductionId { get; set; }
        public string? Name { get; set; }
        public string Polygon { get; set; }
        public bool Active { get; set; }
    }
}
