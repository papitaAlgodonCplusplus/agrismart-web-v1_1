using Agrismart.Agronomic.UI.Services.Models;

namespace Agrismart.Agronomic.UI.Services.Responses
{
    public record GetAllRelayModulesResponse
    {
        public IReadOnlyList<RelayModule>? RelayModules { get; set; } = new List<RelayModule>();
    }
}