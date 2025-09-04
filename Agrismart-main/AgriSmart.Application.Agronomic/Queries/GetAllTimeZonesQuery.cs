using AgriSmart.Application.Agronomic.Responses.Queries;
using AgriSmart.Core.Responses;
using MediatR;

namespace AgriSmart.Application.Agronomic.Queries
{
    public record GetAllTimeZonesQuery : IRequest<Response<GetAllTimeZonesResponse>>
    {
        public bool IncludeInactives { get; set; }
    }
}