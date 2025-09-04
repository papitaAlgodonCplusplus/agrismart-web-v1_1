using AgriSmart.Application.Agronomic.Responses.Queries;
using AgriSmart.Core.Responses;
using MediatR;

namespace AgriSmart.Application.Agronomic.Queries
{
    public record GetAllRelayModulesQuery : IRequest<Response<GetAllRelayModulesResponse>>
    {
        public bool IncludeInactives { get; set; }
    }
}