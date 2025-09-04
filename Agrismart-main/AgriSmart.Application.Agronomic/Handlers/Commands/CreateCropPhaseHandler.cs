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
    public class CreateCropPhaseHandler : IRequestHandler<CreateCropPhaseCommand, Response<CreateCropPhaseResponse>>
    {
        private readonly ICropPhaseCommandRepository _cropPhaseCommandRepository;

        public CreateCropPhaseHandler(ICropPhaseCommandRepository cropPhaseCommandRepository)
        {
            _cropPhaseCommandRepository = cropPhaseCommandRepository;            
        }

        public async Task<Response<CreateCropPhaseResponse>> Handle(CreateCropPhaseCommand command, CancellationToken cancellationToken)
        {
            try
            {
                using (CreateCropPhaseValidator validator = new CreateCropPhaseValidator())
                {
                    var errors = validator.Validate(command);
                    if (!string.IsNullOrWhiteSpace(errors.ToString()))
                        return new Response<CreateCropPhaseResponse>(new Exception(errors.ToString()));
                }

                CropPhase newCropPhase = AgronomicMapper.Mapper.Map<CropPhase>(command);

                newCropPhase.CreatedBy = _cropPhaseCommandRepository.GetSessionUserId();
                newCropPhase.Active = true;

                var createCropProductionResult = await _cropPhaseCommandRepository.CreateAsync(newCropPhase);

                if (createCropProductionResult != null)
                {
                    CreateCropPhaseResponse createCropPhaseResponse = AgronomicMapper.Mapper.Map<CreateCropPhaseResponse>(createCropProductionResult);

                    return new Response<CreateCropPhaseResponse>(createCropPhaseResponse);
                }
                return new Response<CreateCropPhaseResponse>(new Exception("Object returned is null"));
            }
            catch (Exception ex)
            {
                return new Response<CreateCropPhaseResponse>(ex);
            }
        }
    }
}
