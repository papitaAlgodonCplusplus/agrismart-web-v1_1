using AgriSmart.Application.Agronomic.Responses.Queries;
using AgriSmart.Core.Responses;
using MediatR;

namespace AgriSmart.Application.Agronomic.Queries
{
    public record GetAllClientsQuery : IRequest<Response<GetAllClientsResponse>>
    {
        public bool IncludeInactives { get; set; }
    }
}