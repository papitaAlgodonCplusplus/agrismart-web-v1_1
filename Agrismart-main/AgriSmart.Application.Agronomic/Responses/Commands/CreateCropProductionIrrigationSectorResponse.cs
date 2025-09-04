using Microsoft.SqlServer.Types;

namespace AgriSmart.Application.Agronomic.Responses.Commands
{
    public record CreateCropProductionIrrigationSectorResponse
    {
        public int Id { get; set; }
        public int CropProductionId { get; set; }
        public string? Name { get; set; }
        public SqlGeometry Polygon { get; set; }
        public bool Active { get; set; }
    }
}
