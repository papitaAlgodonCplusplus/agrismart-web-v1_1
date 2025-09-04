using AgriSmart.Core.Entities;

namespace AgriSmart.Application.Agronomic.Responses.Queries
{
    public record GetRelayModuleByIdResponse
    {
        public RelayModule? RelayModule { get; set; } = new RelayModule();
    }
}
