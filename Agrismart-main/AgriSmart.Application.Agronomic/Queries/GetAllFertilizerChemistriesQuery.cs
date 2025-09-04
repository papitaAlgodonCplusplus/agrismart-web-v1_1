using AgriSmart.Application.Agronomic.Responses.Queries;
using AgriSmart.Core.Responses;
using MediatR;

namespace AgriSmart.Application.Agronomic.Queries
{
    public record GetAllFertilizerChemistriesQuery : IRequest<Response<GetAllFertilizerChemistriesResponse>>
    {
        public int FertilizerId { get; set; } = 0;
        public bool IncludeInactives { get; set; }
        public int CatalogId { get; set; }
    }
}