using AgriSmart.Core.Entities;

namespace AgriSmart.Application.Agronomic.Responses.Queries
{
    public record GetAllProductionUnitTypesResponse
    {
        public IReadOnlyList<ProductionUnitType>? ProductionUnitTypes { get; set; } = new List<ProductionUnitType>();
    }
}
