using AgriSmart.Core.Entities;

namespace AgriSmart.Application.Agronomic.Responses.Queries
{
    public record GetAllRelayModulesResponse
    {
        public IReadOnlyList<RelayModule>? RelayModules { get; set; } = new List<RelayModule>();
    }
}
