using AgriSmart.AgronomicProcess.Models;

namespace AgriSmart.AgronomicProcess.Services.Responses
{
    public record GetAllProductionUnitsResponse
    {
        public IReadOnlyList<ProductionUnit>? ProductionUnits { get; set; }
    }
}
