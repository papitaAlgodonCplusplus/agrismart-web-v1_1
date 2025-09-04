using AgriSmart.Core.Entities;

namespace AgriSmart.Application.Agronomic.Responses.Queries
{
    public record GetAllRelayModuleCropProductionIrrigationSectorsResponse
    {
        public IReadOnlyList<RelayModuleCropProductionIrrigationSector>? RelayModuleCropProductionIrrigationSectors { get; set; } = new List<RelayModuleCropProductionIrrigationSector>();
    }
}