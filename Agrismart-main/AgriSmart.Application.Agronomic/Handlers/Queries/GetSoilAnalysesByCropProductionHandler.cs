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
    public class GetSoilAnalysesByCropProductionHandler : IRequestHandler<GetSoilAnalysesByCropProductionQuery, Response<GetSoilAnalysesByCropProductionResponse>>
    {
        private readonly ISoilAnalysisQueryRepository _soilAnalysisQueryRepository;

        public GetSoilAnalysesByCropProductionHandler(ISoilAnalysisQueryRepository soilAnalysisQueryRepository)
        {
            _soilAnalysisQueryRepository = soilAnalysisQueryRepository;
        }

        public async Task<Response<GetSoilAnalysesByCropProductionResponse>> Handle(GetSoilAnalysesByCropProductionQuery query, CancellationToken cancellationToken)
        {
            try
            {
                var result = await _soilAnalysisQueryRepository.GetByCropProductionIdAsync(query.CropProductionId, query.IncludeInactive);

                GetSoilAnalysesByCropProductionResponse response = new GetSoilAnalysesByCropProductionResponse
                {
                    SoilAnalyses = result
                };
                return new Response<GetSoilAnalysesByCropProductionResponse>(response);
            }
            catch (Exception ex)
            {
                return new Response<GetSoilAnalysesByCropProductionResponse>(ex);
            }
        }
    }
}
