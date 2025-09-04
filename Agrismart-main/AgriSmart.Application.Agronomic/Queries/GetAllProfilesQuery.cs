using AgriSmart.Application.Agronomic.Responses.Queries;
using AgriSmart.Core.Responses;
using MediatR;

namespace AgriSmart.Application.Agronomic.Queries
{
    public record GetAllProfilesQuery : IRequest<Response<GetAllProfilesResponse>>
    {
        public bool IncludeInactives { get; set; }
    }
}