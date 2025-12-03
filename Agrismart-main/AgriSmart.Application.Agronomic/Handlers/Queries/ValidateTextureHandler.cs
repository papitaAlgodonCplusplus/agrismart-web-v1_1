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
    public class ValidateTextureHandler : IRequestHandler<ValidateTextureQuery, Response<ValidateTextureResponse>>
    {
        private readonly ISoilAnalysisQueryRepository _soilAnalysisQueryRepository;

        public ValidateTextureHandler(ISoilAnalysisQueryRepository soilAnalysisQueryRepository)
        {
            _soilAnalysisQueryRepository = soilAnalysisQueryRepository;
        }

        public async Task<Response<ValidateTextureResponse>> Handle(ValidateTextureQuery query, CancellationToken cancellationToken)
        {
            try
            {
                var textureClass = await _soilAnalysisQueryRepository.DetermineTextureClassAsync(query.Sand, query.Silt, query.Clay);

                ValidateTextureResponse response = new ValidateTextureResponse
                {
                    IsValid = textureClass != "Invalid" && textureClass != "Unclassified",
                    TextureClass = textureClass,
                    ErrorMessage = textureClass == "Invalid" ? "Sum of sand, silt, and clay must equal 100%" :
                                   textureClass == "Unclassified" ? "Could not determine texture class for given percentages" : null
                };
                return new Response<ValidateTextureResponse>(response);
            }
            catch (Exception ex)
            {
                return new Response<ValidateTextureResponse>(ex);
            }
        }
    }
}
