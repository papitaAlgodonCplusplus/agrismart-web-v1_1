using AgriSmart.Application.Agronomic.Commands;
using AgriSmart.Application.Agronomic.Mappers;
using AgriSmart.Application.Agronomic.Responses.Commands;
using AgriSmart.Application.Agronomic.Validators.Commands;
using AgriSmart.Core.Entities;
using AgriSmart.Core.Repositories.Commands;
using AgriSmart.Core.Repositories.Queries;
using AgriSmart.Core.Responses;
using MediatR;

namespace AgriSmart.Application.Agronomic.Handlers.Commands
{
    public class UpdateDeviceHandler : IRequestHandler<UpdateDeviceCommand, Response<UpdateDeviceResponse>>
    {
        private readonly IDeviceCommandRepository _deviceCommandRepository;
        private readonly IDeviceQueryRepository _deviceQueryRepository;

        public UpdateDeviceHandler(IDeviceCommandRepository deviceCommandRepository, IDeviceQueryRepository deviceQueryRepository)
        {
            _deviceCommandRepository = deviceCommandRepository;     
            _deviceQueryRepository = deviceQueryRepository;
        }

        public async Task<Response<UpdateDeviceResponse>> Handle(UpdateDeviceCommand command, CancellationToken cancellationToken)
        {
            try
            {
                using (UpdateDeviceValidator validator = new UpdateDeviceValidator())
                {
                    var errors = validator.Validate(command);
                    if (!string.IsNullOrWhiteSpace(errors.ToString()))
                        return new Response<UpdateDeviceResponse>(new Exception(errors.ToString()));
                }

                Device getResult = await _deviceQueryRepository.GetByIdAsync(command.Id);

                if (getResult != null)
                {
                    getResult.DeviceId = command.DeviceId;
                    getResult.Active = command.Active;
                }

                Device updateDeviceResult = await _deviceCommandRepository.UpdateAsync(getResult);

                if (updateDeviceResult != null)
                {
                    UpdateDeviceResponse updateDeviceResponse = AgronomicMapper.Mapper.Map<UpdateDeviceResponse>(updateDeviceResult);

                    return new Response<UpdateDeviceResponse>(updateDeviceResponse);
                }
                return new Response<UpdateDeviceResponse>(new Exception("Object returned is null"));
            }
            catch (Exception ex)
            {
                return new Response<UpdateDeviceResponse>(ex);
            }
        }
    }
}
