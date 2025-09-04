using AgriSmart.Application.Agronomic.Responses.Queries;
using AgriSmart.Core.Responses;
using MediatR;

namespace AgriSmart.Application.Agronomic.Queries
{
    public record GetAllGraphsQuery : IRequest<Response<GetAllGraphsResponse>>
    {
        public int CatalogId { get; set; }
        public bool IncludeInactives { get; set; }
    }
}