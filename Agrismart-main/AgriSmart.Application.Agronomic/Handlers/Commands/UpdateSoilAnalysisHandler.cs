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
    public class UpdateSoilAnalysisHandler : IRequestHandler<UpdateSoilAnalysisCommand, Response<UpdateSoilAnalysisResponse>>
    {
        private readonly ISoilAnalysisCommandRepository _soilAnalysisCommandRepository;

        public UpdateSoilAnalysisHandler(ISoilAnalysisCommandRepository soilAnalysisCommandRepository)
        {
            _soilAnalysisCommandRepository = soilAnalysisCommandRepository;
        }

        public async Task<Response<UpdateSoilAnalysisResponse>> Handle(UpdateSoilAnalysisCommand command, CancellationToken cancellationToken)
        {
            try
            {
                using (UpdateSoilAnalysisValidator validator = new UpdateSoilAnalysisValidator())
                {
                    var errors = validator.Validate(command);
                    if (!string.IsNullOrWhiteSpace(errors.ToString()))
                        return new Response<UpdateSoilAnalysisResponse>(new Exception(errors.ToString()));
                }

                SoilAnalysis soilAnalysis = AgronomicMapper.Mapper.Map<SoilAnalysis>(command);

                var updateResult = await _soilAnalysisCommandRepository.UpdateWithCalculationsAsync(soilAnalysis);

                if (updateResult != null)
                {
                    UpdateSoilAnalysisResponse response = AgronomicMapper.Mapper.Map<UpdateSoilAnalysisResponse>(updateResult);
                    return new Response<UpdateSoilAnalysisResponse>(response);
                }
                return new Response<UpdateSoilAnalysisResponse>(new Exception("Object returned is null"));
            }
            catch (Exception ex)
            {
                return new Response<UpdateSoilAnalysisResponse>(ex);
            }
        }
    }
}
