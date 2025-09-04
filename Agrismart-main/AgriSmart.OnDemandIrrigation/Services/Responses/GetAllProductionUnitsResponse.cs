using AgriSmart.OnDemandIrrigation.Models;

namespace AgriSmart.OnDemandIrrigation.Services.Responses
{
    public record GetAllProductionUnitsResponse
    {
        public IReadOnlyList<ProductionUnit>? ProductionUnits { get; set; }
    }
}
