namespace Agrismart.Agronomic.UI.Services.Requests.Commands
{
    public record CreateCropProductionIrrigationSectorRequest
    {
        public int CropProductionId { get; set; }
        public string? Name { get; set; }
        public string Polygon { get; set; }
    }
}
