using AgriSmart.Application.Agronomic.Commands;
using AgriSmart.Application.Agronomic.Responses.Commands;
using AgriSmart.Application.Agronomic.Validators.Commands;
using AgriSmart.Core.Repositories.Commands;
using AgriSmart.Core.Responses;
using MediatR;
using System;
using System.Threading;
using System.Threading.Tasks;

namespace AgriSmart.Application.Agronomic.Handlers.Commands
{
    public class DeleteSoilAnalysisHandler : IRequestHandler<DeleteSoilAnalysisCommand, Response<DeleteSoilAnalysisResponse>>
    {
        private readonly ISoilAnalysisCommandRepository _soilAnalysisCommandRepository;

        public DeleteSoilAnalysisHandler(ISoilAnalysisCommandRepository soilAnalysisCommandRepository)
        {
            _soilAnalysisCommandRepository = soilAnalysisCommandRepository;
        }

        public async Task<Response<DeleteSoilAnalysisResponse>> Handle(DeleteSoilAnalysisCommand command, CancellationToken cancellationToken)
        {
            try
            {
                using (DeleteSoilAnalysisValidator validator = new DeleteSoilAnalysisValidator())
                {
                    var errors = validator.Validate(command);
                    if (!string.IsNullOrWhiteSpace(errors.ToString()))
                        return new Response<DeleteSoilAnalysisResponse>(new Exception(errors.ToString()));
                }

                var result = await _soilAnalysisCommandRepository.SoftDeleteAsync(command.Id);

                if (result)
                {
                    return new Response<DeleteSoilAnalysisResponse>(new DeleteSoilAnalysisResponse
                    {
                        Id = command.Id,
                        Success = true,
                        Message = "Soil analysis deleted successfully"
                    });
                }
                return new Response<DeleteSoilAnalysisResponse>(new Exception($"Soil analysis with ID {command.Id} not found"));
            }
            catch (Exception ex)
            {
                return new Response<DeleteSoilAnalysisResponse>(ex);
            }
        }
    }
}
