using AgriSmart.Application.Agronomic.Responses.Queries;
using AgriSmart.Core.Responses;
using MediatR;

namespace AgriSmart.Application.Agronomic.Queries
{
    public record GetAllFertilizerInputsQuery : IRequest<Response<GetAllFertilizerInputsResponse>>
    {
        public int CatalogId { get; set; } = 0;
        public int FertilizerId { get; set; } = 0;
        public bool IncludeInactives { get; set; }
    }
}