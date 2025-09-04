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
    public class CreateCropPhaseOptimalHandler : IRequestHandler<CreateCropPhaseOptimalCommand, Response<CreateCropPhaseOptimalResponse>>
    {
        private readonly ICropPhaseOptimalCommandRepository _cropPhaseOptimalCommandRepository;

        public CreateCropPhaseOptimalHandler(ICropPhaseOptimalCommandRepository cropPhaseOptimalCommandRepository)
        {
            _cropPhaseOptimalCommandRepository = cropPhaseOptimalCommandRepository;            
        }

        public async Task<Response<CreateCropPhaseOptimalResponse>> Handle(CreateCropPhaseOptimalCommand command, CancellationToken cancellationToken)
        {
            try
            {
                using (CreateCropPhaseOptimalValidator validator = new CreateCropPhaseOptimalValidator())
                {
                    var errors = validator.Validate(command);
                    if (!string.IsNullOrWhiteSpace(errors.ToString()))
                        return new Response<CreateCropPhaseOptimalResponse>(new Exception(errors.ToString()));
                }

                CropPhaseOptimal newCropPhaseOptimal = AgronomicMapper.Mapper.Map<CropPhaseOptimal>(command);

                newCropPhaseOptimal.CreatedBy = _cropPhaseOptimalCommandRepository.GetSessionUserId();
                newCropPhaseOptimal.Active = true;

                var createCropPhaseOptimalResult = await _cropPhaseOptimalCommandRepository.CreateAsync(newCropPhaseOptimal);

                if (createCropPhaseOptimalResult != null)
                {
                    CreateCropPhaseOptimalResponse createCropPhaseOptimalResponse = AgronomicMapper.Mapper.Map<CreateCropPhaseOptimalResponse>(createCropPhaseOptimalResult);

                    return new Response<CreateCropPhaseOptimalResponse>(createCropPhaseOptimalResponse);
                }
                return new Response<CreateCropPhaseOptimalResponse>(new Exception("Object returned is null"));
            }
            catch (Exception ex)
            {
                return new Response<CreateCropPhaseOptimalResponse>(ex);
            }
        }
    }
}