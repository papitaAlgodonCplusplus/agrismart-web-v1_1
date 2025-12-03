using AgriSmart.Application.Agronomic.Responses.Queries;
using AgriSmart.Core.Responses;
using MediatR;

namespace AgriSmart.Application.Agronomic.Queries
{
    public record GetSoilAnalysesByCropProductionQuery : IRequest<Response<GetSoilAnalysesByCropProductionResponse>>
    {
        public int CropProductionId { get; set; }
        public bool IncludeInactive { get; set; } = false;
    }
}
