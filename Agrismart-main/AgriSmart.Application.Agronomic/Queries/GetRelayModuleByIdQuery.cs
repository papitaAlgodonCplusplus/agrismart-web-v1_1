using AgriSmart.Application.Agronomic.Responses.Queries;
using AgriSmart.Core.Responses;
using MediatR;

namespace AgriSmart.Application.Agronomic.Queries
{
    public record GetRelayModuleByIdQuery : IRequest<Response<GetRelayModuleByIdResponse>>
    {
        public int Id { get; set; }
    }
}