using AgriSmart.Application.Agronomic.Responses.Queries;
using AgriSmart.Core.Responses;
using MediatR;

namespace AgriSmart.Application.Agronomic.Queries
{
    public record GetAllContainerTypesQuery : IRequest<Response<GetAllContainerTypesResponse>>
    {
        public bool IncludeInactives { get; set; }
    }
}