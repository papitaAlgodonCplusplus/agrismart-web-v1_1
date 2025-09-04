using AgriSmart.Application.Iot.Commands;
using AgriSmart.Application.Iot.Responses.Commands;
using AgriSmart.Application.Iot.Validators;
using AgriSmart.Core.Entities;
using AgriSmart.Core.Repositories.Commands;
using AgriSmart.Core.Repositories.Queries;
using AgriSmart.Core.Responses;
using MediatR;

namespace AgriSmart.Application.Iot.Handlers
{
    public class ProcessDeviceRawDataHandler : IRequestHandler<ProcessDeviceRawDataCommand, Response<ProcessDeviceRawDataResponse>>
    {
        private readonly IDeviceRawDataCommandRepository _deviceRawDataCommandRepository;

        public ProcessDeviceRawDataHandler(IDeviceRawDataCommandRepository deviceRawDataCommandRepository)
        {
            _deviceRawDataCommandRepository = deviceRawDataCommandRepository;            
        }

        /// <summary>
        /// Gets the device that belongs to the provided id
        /// </summary>
        /// <param name="request"></param>
        /// <param name="cancellationToken"></param>
        /// <returns></returns>
        public async Task<Response<ProcessDeviceRawDataResponse>> Handle(ProcessDeviceRawDataCommand request, CancellationToken cancellationToken)
        {
            try
            {

                ProcessDeviceRawDataValidator validator = new();
                var validatorResult = validator.Validate(request).ToString();

                if (!string.IsNullOrEmpty(validatorResult))
                    return new Response<ProcessDeviceRawDataResponse>(new Exception(validatorResult));

                //var result = await _deviceRawDataCommandRepository.ProcessDeviceRawData(request.DeviceId);
                //if (result == null)
                //{
                //    return new Response<ProcessDeviceRawDataResponse>(new Exception("There was an error processing DeviceRawData"));
                //}

                return new Response<ProcessDeviceRawDataResponse>(new ProcessDeviceRawDataResponse() { DeviceRawDataProcessed = true });

            }
            catch (Exception ex)
            {
                return new Response<ProcessDeviceRawDataResponse>(ex);
            }
        }
    }
}
