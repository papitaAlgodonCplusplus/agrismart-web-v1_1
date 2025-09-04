using AgriSmart.Application.Agronomic.Responses.Queries;
using AgriSmart.Core.Responses;
using MediatR;

namespace AgriSmart.Application.Agronomic.Queries
{
    public record GetAllUserStatusesQuery : IRequest<Response<GetAllUserStatusesResponse>>
    {
        public bool IncludeInactives { get; set; }
    }
}