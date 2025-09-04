using AgriSmart.Application.Agronomic.Responses.Queries;
using AgriSmart.Core.Responses;
using MediatR;

namespace AgriSmart.Application.Agronomic.Queries
{
    public record GetAllWaterChemistriesQuery : IRequest<Response<GetAllWaterChemistriesResponse>>
    {
        public int WaterId { get; set; } = 0;
        public int CatalogId { get; set; } = 0;
        public bool IncludeInactives { get; set; }
    }
}