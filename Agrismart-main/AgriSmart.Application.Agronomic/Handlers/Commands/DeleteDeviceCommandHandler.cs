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
    public class DeleteDeviceCommandHandler : IRequestHandler<DeleteDeviceCommand, Response<DeleteDeviceResponse>>
    {
        private readonly IDeviceCommandRepository _deviceCommandRepository;

        public DeleteDeviceCommandHandler(IDeviceCommandRepository deviceCommandRepository)
        {
            _deviceCommandRepository = deviceCommandRepository;
        }

        public async Task<Response<DeleteDeviceResponse>> Handle(DeleteDeviceCommand command, CancellationToken cancellationToken)
        {
            try
            {
                using (DeleteDeviceValidator validator = new DeleteDeviceValidator())
                {
                    var errors = validator.Validate(command);
                    if (!string.IsNullOrWhiteSpace(errors.ToString()))
                        return new Response<DeleteDeviceResponse>(new Exception(errors.ToString()));
                }

                Device deleteDevice = AgronomicMapper.Mapper.Map<Device>(command);

                await _deviceCommandRepository.DeleteAsync(deleteDevice);

                return new Response<DeleteDeviceResponse>(new DeleteDeviceResponse { Id = command.Id });
            }
            catch (Exception ex)
            {
                return new Response<DeleteDeviceResponse>(ex);
            }
        }
    }
}