using AgriSmart.Application.Iot.Commands;
using AgriSmart.Application.Iot.Responses.Commands;
using AgriSmart.Application.Iot.Services;
using AgriSmart.Application.Iot.Validators;
using AgriSmart.Core.Entities;
using AgriSmart.Core.Repositories.Commands;
using AgriSmart.Core.Repositories.Queries;
using AgriSmart.Core.Responses;
using MediatR;
using Microsoft.AspNetCore.Http;
using System.Security;

namespace AgriSmart.Application.Iot.Handlers
{
    public class AddDeviceRawDataHandler : IRequestHandler<AddDeviceRawDataCommand, Response<AddDeviceRawDataResponse>>
    {
        private readonly IDeviceRawDataCommandRepository _deviceRawDataCommandRepository;
        private readonly DeviceSensorCacheService _deviceSensorCacheService;

        public AddDeviceRawDataHandler(IDeviceRawDataCommandRepository deviceRawDataCommandRepository, DeviceSensorCacheService deviceSensorCacheService)
        {
            _deviceRawDataCommandRepository = deviceRawDataCommandRepository;
            _deviceSensorCacheService = deviceSensorCacheService;
        }

        /// <summary>
        /// Gets the device that belongs to the provided id
        /// </summary>
        /// <param name="request"></param>
        /// <param name="cancellationToken"></param>
        /// <returns></returns>
        public async Task<Response<AddDeviceRawDataResponse>> Handle(AddDeviceRawDataCommand request, CancellationToken cancellationToken)
        {
            try
            {

                AddDeviceRawDataValidator validator = new();
                var validatorResult = validator.Validate(request).ToString();

                if (!string.IsNullOrEmpty(validatorResult))
                    return new Response<AddDeviceRawDataResponse>(new Exception(validatorResult));

                string PayloadString = request.Uplink_Message.Decoded_Payload.ToString().Replace("{", "").Replace("}", "").Replace("\n", "").Replace("\"","").Replace(" ","");

                string[] Payloads = PayloadString.Split(',');

                foreach (string Payload in Payloads)
                {
                    bool isValid = ValidateDeviceSensor(request.End_Device_Ids.Device_Id, Payload.Split(':')[0]);

                    if (isValid)
                    {
                        DateTime dateTime = DateTime.Parse(request.Received_at, null, System.Globalization.DateTimeStyles.RoundtripKind);

                        DeviceRawData data = new DeviceRawData()
                        {
                            RecordDate = dateTime,
                            Sensor = Payload.Split(':')[0],
                            Payload = Payload.Split(':')[1],
                            DeviceId = request.End_Device_Ids.Device_Id,
                            ClientId = request.End_Device_Ids.application_Ids.Application_Id,
                            UserId = "Lora"
                        };
                        var result = await _deviceRawDataCommandRepository.CreateAsync(data);
                        if (result == null)
                        {
                            return new Response<AddDeviceRawDataResponse>(new Exception("There was an error adding DeviceRawData"));
                        }
                    }
                    else
                    {
                        return new Response<AddDeviceRawDataResponse>(new Exception("Device or Sensor is not registered or inactive"));
                    }
                }
                return new Response<AddDeviceRawDataResponse>(new AddDeviceRawDataResponse() { DeviceRawDataAdded = true });

            }
            catch (Exception ex)
            {
                return new Response<AddDeviceRawDataResponse>(ex);
            }
        }

        private bool ValidateDeviceSensor(string deviceId, string sensorLabel)
        {
            List<Device> devices = _deviceSensorCacheService.GetDevices();

            if (devices == null)
                return false;

            Device device = devices.Where(x => x.DeviceId == deviceId).FirstOrDefault();

            if (device == null) 
                return false;

            List<Sensor> sensors = _deviceSensorCacheService.GetSensors();
            if (sensors == null) return false;

            Sensor sensor = sensors.Where(x => x.SensorLabel == sensorLabel && x.DeviceId == device.Id).FirstOrDefault();

            if (sensor == null)
                return false;

            return true;
        }
    }
}
