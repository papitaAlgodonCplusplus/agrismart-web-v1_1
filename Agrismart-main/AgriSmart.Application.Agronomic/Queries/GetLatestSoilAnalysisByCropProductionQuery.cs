using AgriSmart.Application.Agronomic.Responses.Queries;
using AgriSmart.Core.Responses;
using MediatR;

namespace AgriSmart.Application.Agronomic.Queries
{
    public record GetLatestSoilAnalysisByCropProductionQuery : IRequest<Response<GetLatestSoilAnalysisByCropProductionResponse>>
    {
        public int CropProductionId { get; set; }
    }
}
