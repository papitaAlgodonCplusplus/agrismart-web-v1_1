using AgriSmart.Application.Agronomic.Commands;
using AgriSmart.Application.Agronomic.Mappers;
using AgriSmart.Application.Agronomic.Responses.Commands;
using AgriSmart.Application.Agronomic.Validators.Commands;
using AgriSmart.Core.Entities;
using AgriSmart.Core.Repositories.Commands;
using AgriSmart.Core.Responses;
using MediatR;
using System;
using System.Threading;
using System.Threading.Tasks;

namespace AgriSmart.Application.Agronomic.Handlers.Commands
{
    public class CreateSoilAnalysisHandler : IRequestHandler<CreateSoilAnalysisCommand, Response<CreateSoilAnalysisResponse>>
    {
        private readonly ISoilAnalysisCommandRepository _soilAnalysisCommandRepository;

        public CreateSoilAnalysisHandler(ISoilAnalysisCommandRepository soilAnalysisCommandRepository)
        {
            _soilAnalysisCommandRepository = soilAnalysisCommandRepository;
        }

        public async Task<Response<CreateSoilAnalysisResponse>> Handle(CreateSoilAnalysisCommand command, CancellationToken cancellationToken)
        {
            try
            {
                using (CreateSoilAnalysisValidator validator = new CreateSoilAnalysisValidator())
                {
                    var errors = validator.Validate(command);
                    if (!string.IsNullOrWhiteSpace(errors.ToString()))
                        return new Response<CreateSoilAnalysisResponse>(new Exception(errors.ToString()));
                }

                SoilAnalysis newSoilAnalysis = AgronomicMapper.Mapper.Map<SoilAnalysis>(command);

                var createResult = await _soilAnalysisCommandRepository.CreateWithCalculationsAsync(newSoilAnalysis);

                if (createResult != null)
                {
                    CreateSoilAnalysisResponse response = AgronomicMapper.Mapper.Map<CreateSoilAnalysisResponse>(createResult);
                    return new Response<CreateSoilAnalysisResponse>(response);
                }
                return new Response<CreateSoilAnalysisResponse>(new Exception("Object returned is null"));
            }
            catch (Exception ex)
            {
                return new Response<CreateSoilAnalysisResponse>(ex);
            }
        }
    }
}
