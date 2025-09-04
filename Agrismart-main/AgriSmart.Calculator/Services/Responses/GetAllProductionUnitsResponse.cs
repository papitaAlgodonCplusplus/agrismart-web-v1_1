using AgriSmart.Calculator.Models;

namespace AgriSmart.Calculator.Services.Responses
{
    public record GetAllProductionUnitsResponse
    {
        public IReadOnlyList<ProductionUnit>? ProductionUnits { get; set; }
    }
}
