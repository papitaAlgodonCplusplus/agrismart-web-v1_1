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
    public class UpdateCropPhaseSolutionRequirementHandler : IRequestHandler<UpdateCropPhaseSolutionRequirementCommand, Response<UpdateCropPhaseSolutionRequirementResponse>>
    {
        private readonly ICropPhaseSolutionRequirementCommandRepository _cropPhaseSolutionRequirementCommandRepository;

        public UpdateCropPhaseSolutionRequirementHandler(ICropPhaseSolutionRequirementCommandRepository cropPhaseSolutionRequirementCommandRepository)
        {
            _cropPhaseSolutionRequirementCommandRepository = cropPhaseSolutionRequirementCommandRepository;
        }

        public async Task<Response<UpdateCropPhaseSolutionRequirementResponse>> Handle(UpdateCropPhaseSolutionRequirementCommand command, CancellationToken cancellationToken)
        {
            try
            {
                using (UpdateCropPhaseSolutionRequirementValidator validator = new UpdateCropPhaseSolutionRequirementValidator())
                {
                    var errors = validator.Validate(command);
                    if (!string.IsNullOrWhiteSpace(errors.ToString()))
                        return new Response<UpdateCropPhaseSolutionRequirementResponse>(new Exception(errors.ToString()));
                }

                CropPhaseSolutionRequirement entity = AgronomicMapper.Mapper.Map<CropPhaseSolutionRequirement>(command);

                entity.UpdatedBy = _cropPhaseSolutionRequirementCommandRepository.GetSessionUserId();
                entity.DateUpdated = DateTime.UtcNow;

                var updateResult = await _cropPhaseSolutionRequirementCommandRepository.UpdateAsync(entity);

                if (updateResult != null)
                {
                    UpdateCropPhaseSolutionRequirementResponse response = AgronomicMapper.Mapper.Map<UpdateCropPhaseSolutionRequirementResponse>(updateResult);

                    return new Response<UpdateCropPhaseSolutionRequirementResponse>(response);
                }
                return new Response<UpdateCropPhaseSolutionRequirementResponse>(new Exception("Object returned is null"));
            }
            catch (Exception ex)
            {
                return new Response<UpdateCropPhaseSolutionRequirementResponse>(ex);
            }
        }
    }
}