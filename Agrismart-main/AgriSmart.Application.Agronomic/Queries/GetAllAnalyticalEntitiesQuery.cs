using AgriSmart.Application.Agronomic.Responses.Queries;
using AgriSmart.Core.Responses;
using MediatR;

namespace AgriSmart.Application.Agronomic.Queries
{
    public record GetAllAnalyticalEntitiesQuery : IRequest<Response<GetAllAnalyticalEntitiesResponse>>
    {
        public int CatalogId { get; set; }
        public bool IncludeInactives { get; set; }
    }
}