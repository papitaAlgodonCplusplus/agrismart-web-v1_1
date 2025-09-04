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
    public class CreateCropProductionDeviceHandler : IRequestHandler<CreateCropProductionDeviceCommand, Response<CreateCropProductionDeviceResponse>>
    {
        private readonly ICropProductionDeviceCommandRepository _cropProductionDeviceCommandRepository;

        public CreateCropProductionDeviceHandler(ICropProductionDeviceCommandRepository cropProductionDeviceCommandRepository)
        {
            _cropProductionDeviceCommandRepository = cropProductionDeviceCommandRepository;            
        }

        public async Task<Response<CreateCropProductionDeviceResponse>> Handle(CreateCropProductionDeviceCommand command, CancellationToken cancellationToken)
        {
            try
            {
                using (CreateCropProductionDeviceValidator validator = new CreateCropProductionDeviceValidator())
                {
                    var errors = validator.Validate(command);
                    if (!string.IsNullOrWhiteSpace(errors.ToString()))
                        return new Response<CreateCropProductionDeviceResponse>(new Exception(errors.ToString()));
                }

                CropProductionDevice newCropProductionDevice = AgronomicMapper.Mapper.Map<CropProductionDevice>(command);

                newCropProductionDevice.CreatedBy = _cropProductionDeviceCommandRepository.GetSessionUserId();
                newCropProductionDevice.Active = true;

                var createCropProductionDeviceResult = await _cropProductionDeviceCommandRepository.CreateAsync(newCropProductionDevice);

                if (createCropProductionDeviceResult != null)
                {
                    CreateCropProductionDeviceResponse createCropProductionDeviceResponse = AgronomicMapper.Mapper.Map<CreateCropProductionDeviceResponse>(createCropProductionDeviceResult);

                    return new Response<CreateCropProductionDeviceResponse>(createCropProductionDeviceResponse);
                }
                return new Response<CreateCropProductionDeviceResponse>(new Exception("Object returned is null"));
            }
            catch (Exception ex)
            {
                return new Response<CreateCropProductionDeviceResponse>(ex);
            }
        }
    }
}
