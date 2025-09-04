using Agrismart.Agronomic.UI.Services.Models;

namespace Agrismart.Agronomic.UI.Services.Responses
{
    public record GetAllProductionUnitTypesResponse
    {
        public IReadOnlyList<ProductionUnitType>? ProductionUnitTypes { get; set; } = new List<ProductionUnitType>();
    }
}