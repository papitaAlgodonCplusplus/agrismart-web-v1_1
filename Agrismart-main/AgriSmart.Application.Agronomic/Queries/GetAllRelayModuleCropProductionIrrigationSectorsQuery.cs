using AgriSmart.Application.Agronomic.Responses.Queries;
using AgriSmart.Core.Responses;
using MediatR;

namespace AgriSmart.Application.Agronomic.Queries
{
    public record GetAllRelayModuleCropProductionIrrigationSectorsQuery : IRequest<Response<GetAllRelayModuleCropProductionIrrigationSectorsResponse>>
    {
        public int RelayModuleId { get; set; } = 0;
    }
}