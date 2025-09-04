using Agrismart.Agronomic.UI.Services.Models;

namespace Agrismart.Agronomic.UI.Services.Responses
{
    public record GetAllProductionUnitsResponse
    {
        public IReadOnlyList<ProductionUnit>? ProductionUnits { get; set; } = new List<ProductionUnit>();
    }
}