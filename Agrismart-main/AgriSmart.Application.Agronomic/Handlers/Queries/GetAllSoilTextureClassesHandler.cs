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
    public class GetAllSoilTextureClassesHandler : IRequestHandler<GetAllSoilTextureClassesQuery, Response<GetAllSoilTextureClassesResponse>>
    {
        private readonly ISoilAnalysisQueryRepository _soilAnalysisQueryRepository;

        public GetAllSoilTextureClassesHandler(ISoilAnalysisQueryRepository soilAnalysisQueryRepository)
        {
            _soilAnalysisQueryRepository = soilAnalysisQueryRepository;
        }

        public async Task<Response<GetAllSoilTextureClassesResponse>> Handle(GetAllSoilTextureClassesQuery query, CancellationToken cancellationToken)
        {
            try
            {
                var result = await _soilAnalysisQueryRepository.GetAllTextureClassesAsync();

                GetAllSoilTextureClassesResponse response = new GetAllSoilTextureClassesResponse
                {
                    TextureClasses = result
                };
                return new Response<GetAllSoilTextureClassesResponse>(response);
            }
            catch (Exception ex)
            {
                return new Response<GetAllSoilTextureClassesResponse>(ex);
            }
        }
    }
}
