using AgriSmart.Core.Entities;

namespace AgriSmart.Application.Agronomic.Responses.Queries
{
    public record GetAllProductionUnitsResponse
    {
        public IReadOnlyList<ProductionUnit>? ProductionUnits { get; set; } = new List<ProductionUnit>();
    }
}
