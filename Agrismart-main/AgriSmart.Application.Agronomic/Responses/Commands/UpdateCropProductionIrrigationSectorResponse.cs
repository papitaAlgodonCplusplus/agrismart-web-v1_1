using System.Data.Entity.Spatial;

namespace AgriSmart.Application.Agronomic.Responses.Commands
{
    public record UpdateCropProductionIrrigationSectorResponse
    {
        public int Id { get; set; }
        public int CropProductionId { get; set; }
        public string? Name { get; set; }
        public string? Polygon { get; set; }
        public bool? Active { get; set; }
    }
}
