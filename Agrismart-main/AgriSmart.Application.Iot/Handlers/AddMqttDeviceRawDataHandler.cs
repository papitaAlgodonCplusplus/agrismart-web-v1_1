using AgriSmart.Application.Iot.Commands;
using AgriSmart.Application.Iot.Responses.Commands;
using AgriSmart.Application.Iot.Validators;
using AgriSmart.Core.Entities;
using AgriSmart.Core.Repositories.Commands;
using AgriSmart.Core.Responses;
using MediatR;

namespace AgriSmart.Application.Iot.Handlers
{
    public class AddMqttDeviceRawDataHandler : IRequestHandler<AddMqttDeviceRawDataCommand, Response<AddMqttDeviceRawDataResponse>>
    {
        private readonly IDeviceRawDataCommandRepository _deviceRawDataCommandRepository;

        public AddMqttDeviceRawDataHandler(IDeviceRawDataCommandRepository deviceRawDataCommandRepository)
        {
            _deviceRawDataCommandRepository = deviceRawDataCommandRepository;            
        }

        /// <summary>
        /// Gets the device that belongs to the provided id
        /// </summary>
        /// <param name="request"></param>
        /// <param name="cancellationToken"></param>
        /// <returns></returns>
        public async Task<Response<AddMqttDeviceRawDataResponse>> Handle(AddMqttDeviceRawDataCommand request, CancellationToken cancellationToken)
        {
            try
            {

                AddMqttDeviceRawDataValidator validator = new();
                var validatorResult = validator.Validate(request).ToString();

                if (!string.IsNullOrEmpty(validatorResult))
                    return new Response<AddMqttDeviceRawDataResponse>(new Exception(validatorResult));

                DeviceRawData data = new DeviceRawData()
                {
                    RecordDate = request.RecordDate,
                    Sensor = request.Sensor,
                    Payload = request.Payload,
                    DeviceId = request.DeviceId,
                    ClientId = request.ClientId,
                    UserId = request.UserId
                };

                var result = await _deviceRawDataCommandRepository.CreateAsync(data);
                if (result == null)
                {
                    return new Response<AddMqttDeviceRawDataResponse>(new Exception("There was an error adding DeviceRawData"));
                }
                else
                {
                    return new Response<AddMqttDeviceRawDataResponse>(new AddMqttDeviceRawDataResponse() { MqttDeviceRawDataAdded = true });
                }
            }
            catch (Exception ex)
            {
                return new Response<AddMqttDeviceRawDataResponse>(ex);
            }
        }
    }
}
