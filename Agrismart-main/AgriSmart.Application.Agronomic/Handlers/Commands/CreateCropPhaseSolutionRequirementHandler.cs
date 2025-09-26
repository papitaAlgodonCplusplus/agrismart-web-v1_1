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
    public class CreateCropPhaseSolutionRequirementHandler : IRequestHandler<CreateCropPhaseSolutionRequirementCommand, Response<CreateCropPhaseSolutionRequirementResponse>>
    {
        private readonly ICropPhaseSolutionRequirementCommandRepository _cropPhaseSolutionRequirementCommandRepository;

        public CreateCropPhaseSolutionRequirementHandler(ICropPhaseSolutionRequirementCommandRepository cropPhaseSolutionRequirementCommandRepository)
        {
            _cropPhaseSolutionRequirementCommandRepository = cropPhaseSolutionRequirementCommandRepository;
        }

        public async Task<Response<CreateCropPhaseSolutionRequirementResponse>> Handle(CreateCropPhaseSolutionRequirementCommand command, CancellationToken cancellationToken)
        {
            try
            {
                using (CreateCropPhaseSolutionRequirementValidator validator = new CreateCropPhaseSolutionRequirementValidator())
                {
                    var errors = validator.Validate(command);
                    if (!string.IsNullOrWhiteSpace(errors.ToString()))
                        return new Response<CreateCropPhaseSolutionRequirementResponse>(new Exception(errors.ToString()));
                }

                CropPhaseSolutionRequirement newEntity = AgronomicMapper.Mapper.Map<CropPhaseSolutionRequirement>(command);

                newEntity.CreatedBy = _cropPhaseSolutionRequirementCommandRepository.GetSessionUserId();
                newEntity.Active = command.Active;

                var createResult = await _cropPhaseSolutionRequirementCommandRepository.CreateAsync(newEntity);

                if (createResult != null)
                {
                    CreateCropPhaseSolutionRequirementResponse response = AgronomicMapper.Mapper.Map<CreateCropPhaseSolutionRequirementResponse>(createResult);

                    return new Response<CreateCropPhaseSolutionRequirementResponse>(response);
                }
                return new Response<CreateCropPhaseSolutionRequirementResponse>(new Exception("Object returned is null"));
            }
            catch (Exception ex)
            {
                return new Response<CreateCropPhaseSolutionRequirementResponse>(ex);
            }
        }
    }
}