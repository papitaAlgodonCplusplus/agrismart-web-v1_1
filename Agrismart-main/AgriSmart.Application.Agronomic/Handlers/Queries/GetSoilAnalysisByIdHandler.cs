using AgriSmart.Application.Agronomic.Queries;
using AgriSmart.Application.Agronomic.Responses.Queries;
using AgriSmart.Application.Agronomic.Validators.Queries;
using AgriSmart.Core.Repositories.Queries;
using AgriSmart.Core.Responses;
using MediatR;
using System;
using System.Threading;
using System.Threading.Tasks;

namespace AgriSmart.Application.Agronomic.Handlers.Queries
{
    public class GetSoilAnalysisByIdHandler : IRequestHandler<GetSoilAnalysisByIdQuery, Response<GetSoilAnalysisByIdResponse>>
    {
        private readonly ISoilAnalysisQueryRepository _soilAnalysisQueryRepository;

        public GetSoilAnalysisByIdHandler(ISoilAnalysisQueryRepository soilAnalysisQueryRepository)
        {
            _soilAnalysisQueryRepository = soilAnalysisQueryRepository;
        }

        public async Task<Response<GetSoilAnalysisByIdResponse>> Handle(GetSoilAnalysisByIdQuery query, CancellationToken cancellationToken)
        {
            try
            {
                using (GetSoilAnalysisByIdValidator validator = new GetSoilAnalysisByIdValidator())
                {
                    var errors = validator.Validate(query);
                    if (!string.IsNullOrWhiteSpace(errors.ToString()))
                        return new Response<GetSoilAnalysisByIdResponse>(new Exception(errors.ToString()));
                }

                var result = await _soilAnalysisQueryRepository.GetByIdAsync(query.Id);

                if (result != null)
                {
                    GetSoilAnalysisByIdResponse response = new GetSoilAnalysisByIdResponse
                    {
                        SoilAnalysis = result
                    };
                    return new Response<GetSoilAnalysisByIdResponse>(response);
                }
                return new Response<GetSoilAnalysisByIdResponse>(new Exception("Object returned is null"));
            }
            catch (Exception ex)
            {
                return new Response<GetSoilAnalysisByIdResponse>(ex);
            }
        }
    }
}
