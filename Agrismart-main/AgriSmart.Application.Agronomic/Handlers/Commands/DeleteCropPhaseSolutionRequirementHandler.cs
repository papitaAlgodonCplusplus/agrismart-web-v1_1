using AgriSmart.Application.Agronomic.Commands;
using AgriSmart.Application.Agronomic.Mappers;
using AgriSmart.Application.Agronomic.Responses.Commands;
using AgriSmart.Application.Agronomic.Validators.Commands;
using AgriSmart.Core.Entities;
using AgriSmart.Core.Repositories.Commands;
using AgriSmart.Core.Responses;
using MediatR;

namespace AgriSmart.Application.Agronomic.Handlers.Commands
{
    public class DeleteCropPhaseSolutionRequirementHandler : IRequestHandler<DeleteCropPhaseSolutionRequirementCommand, Response<DeleteCropPhaseSolutionRequirementResponse>>
    {
        private readonly ICropPhaseSolutionRequirementCommandRepository _cropPhaseSolutionRequirementCommandRepository;

        public DeleteCropPhaseSolutionRequirementHandler(ICropPhaseSolutionRequirementCommandRepository cropPhaseSolutionRequirementCommandRepository)
        {
            _cropPhaseSolutionRequirementCommandRepository = cropPhaseSolutionRequirementCommandRepository;
        }

        public async Task<Response<DeleteCropPhaseSolutionRequirementResponse>> Handle(DeleteCropPhaseSolutionRequirementCommand command, CancellationToken cancellationToken)
        {
            try
            {
                using (DeleteCropPhaseSolutionRequirementValidator validator = new DeleteCropPhaseSolutionRequirementValidator())
                {
                    var errors = validator.Validate(command);
                    if (!string.IsNullOrWhiteSpace(errors.ToString()))
                        return new Response<DeleteCropPhaseSolutionRequirementResponse>(new Exception(errors.ToString()));
                }

                CropPhaseSolutionRequirement deleteEntity = AgronomicMapper.Mapper.Map<CropPhaseSolutionRequirement>(command);

                await _cropPhaseSolutionRequirementCommandRepository.DeleteAsync(deleteEntity);

                return new Response<DeleteCropPhaseSolutionRequirementResponse>(new DeleteCropPhaseSolutionRequirementResponse { Id = command.Id, Message = "Deleted successfully" });
            }
            catch (Exception ex)
            {
                return new Response<DeleteCropPhaseSolutionRequirementResponse>(ex);
            }
        }
    }
}