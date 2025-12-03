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
    public class GetAvailableNutrientsHandler : IRequestHandler<GetAvailableNutrientsQuery, Response<GetAvailableNutrientsResponse>>
    {
        private readonly ISoilAnalysisQueryRepository _soilAnalysisQueryRepository;

        public GetAvailableNutrientsHandler(ISoilAnalysisQueryRepository soilAnalysisQueryRepository)
        {
            _soilAnalysisQueryRepository = soilAnalysisQueryRepository;
        }

        public async Task<Response<GetAvailableNutrientsResponse>> Handle(GetAvailableNutrientsQuery query, CancellationToken cancellationToken)
        {
            try
            {
                var result = await _soilAnalysisQueryRepository.GetAvailableNutrientsAsync(query.SoilAnalysisId);

                GetAvailableNutrientsResponse response = new GetAvailableNutrientsResponse
                {
                    AvailableNutrients = result
                };
                return new Response<GetAvailableNutrientsResponse>(response);
            }
            catch (Exception ex)
            {
                return new Response<GetAvailableNutrientsResponse>(ex);
            }
        }
    }
}
