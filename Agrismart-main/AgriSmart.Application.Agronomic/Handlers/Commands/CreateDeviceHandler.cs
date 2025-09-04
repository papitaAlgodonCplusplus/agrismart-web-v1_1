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
    public class CreateDeviceHandler : IRequestHandler<CreateDeviceCommand, Response<CreateDeviceResponse>>
    {
        private readonly IDeviceCommandRepository _deviceCommandRepository;

        public CreateDeviceHandler(IDeviceCommandRepository deviceCommandRepository)
        {
            _deviceCommandRepository = deviceCommandRepository;
        }

        public async Task<Response<CreateDeviceResponse>> Handle(CreateDeviceCommand command, CancellationToken cancellationToken)
        {
            try
            {
                using (CreateDeviceValidator validator = new CreateDeviceValidator())
                {
                    var errors = validator.Validate(command);
                    if (!string.IsNullOrWhiteSpace(errors.ToString()))
                        return new Response<CreateDeviceResponse>(new Exception(errors.ToString()));
                }

                int sessionUserId = _deviceCommandRepository.GetSessionUserId();
                Device newDevice = AgronomicMapper.Mapper.Map<Device>(command);

                newDevice.CreatedBy = sessionUserId;
                newDevice.Active = true;

                var createDeviceResult = await _deviceCommandRepository.CreateAsync(newDevice);

                if (createDeviceResult != null)
                {
                    
                    CreateDeviceResponse createDeviceResponse = AgronomicMapper.Mapper.Map<CreateDeviceResponse>(createDeviceResult);

                    return new Response<CreateDeviceResponse>(createDeviceResponse);
                }
                return new Response<CreateDeviceResponse>(new Exception("Object returned is null"));
            }
            catch (Exception ex)
            {
                return new Response<CreateDeviceResponse>(ex);
            }
        }
    }
}
