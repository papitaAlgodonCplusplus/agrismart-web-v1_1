using AgriSmart.Application.Agronomic.Queries;
using AgriSmart.Application.Agronomic.Responses.Queries;
using AgriSmart.Core.Repositories.Queries;
using AgriSmart.Core.Responses;
using MediatR;
using System;
using System.Threading;
using System.Threading.Tasks;

namespace AgriSmart.Application.Agronomic.Handlers.Queries
{
    public class GetLatestSoilAnalysisByCropProductionHandler : IRequestHandler<GetLatestSoilAnalysisByCropProductionQuery, Response<GetLatestSoilAnalysisByCropProductionResponse>>
    {
        private readonly ISoilAnalysisQueryRepository _soilAnalysisQueryRepository;

        public GetLatestSoilAnalysisByCropProductionHandler(ISoilAnalysisQueryRepository soilAnalysisQueryRepository)
        {
            _soilAnalysisQueryRepository = soilAnalysisQueryRepository;
        }

        public async Task<Response<GetLatestSoilAnalysisByCropProductionResponse>> Handle(GetLatestSoilAnalysisByCropProductionQuery query, CancellationToken cancellationToken)
        {
            try
            {
                var result = await _soilAnalysisQueryRepository.GetLatestByCropProductionIdAsync(query.CropProductionId);

                if (result != null)
                {
                    GetLatestSoilAnalysisByCropProductionResponse response = new GetLatestSoilAnalysisByCropProductionResponse
                    {
                        SoilAnalysis = result
                    };
                    return new Response<GetLatestSoilAnalysisByCropProductionResponse>(response);
                }
                return new Response<GetLatestSoilAnalysisByCropProductionResponse>(new Exception("No soil analysis found"));
            }
            catch (Exception ex)
            {
                return new Response<GetLatestSoilAnalysisByCropProductionResponse>(ex);
            }
        }
    }
}
