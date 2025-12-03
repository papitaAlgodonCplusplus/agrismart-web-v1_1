using AgriSmart.Application.Agronomic.Responses.Queries;
using AgriSmart.Core.Responses;
using MediatR;

namespace AgriSmart.Application.Agronomic.Queries
{
    public record GetAvailableNutrientsQuery : IRequest<Response<GetAvailableNutrientsResponse>>
    {
        public int SoilAnalysisId { get; set; }
    }
}
