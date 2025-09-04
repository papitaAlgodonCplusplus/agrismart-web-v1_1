using AgriSmart.Application.Agronomic.Commands;
using AgriSmart.Application.Agronomic.Responses.Commands;
using AgriSmart.Application.Agronomic.Validators.Commands;
using AgriSmart.Core.Repositories.Commands;
using AgriSmart.Core.Repositories.Queries;
using AgriSmart.Core.Responses;
using MediatR;

namespace AgriSmart.Application.Agronomic.Handlers.Commands
{
    public class ProcessDeviceRawDataMeasurementsHandler : IRequestHandler<ProcessDeviceRawDataMeasurementsCommand, Response<ProcessDeviceRawDataMeasurementsResponse>>
    {
        private readonly IDeviceRawDataCommandRepository _deviceRawDataCommandRepository;

        public ProcessDeviceRawDataMeasurementsHandler(IDeviceRawDataCommandRepository deviceRawDataCommandRepository)
        {
            _deviceRawDataCommandRepository = deviceRawDataCommandRepository;
        }

        public async Task<Response<ProcessDeviceRawDataMeasurementsResponse>> Handle(ProcessDeviceRawDataMeasurementsCommand command, CancellationToken cancellationToken)
        {
            try
            {
                using (ProcessDeviceRawDataMeasurementsValidator validator = new ProcessDeviceRawDataMeasurementsValidator())
                {
                    var errors = validator.Validate(command);
                    if (!string.IsNullOrWhiteSpace(errors.ToString()))
                        return new Response<ProcessDeviceRawDataMeasurementsResponse>(new Exception(errors.ToString()));
                }

                var processDeviceRawDataMeasurementsResult = await _deviceRawDataCommandRepository.ProcessDeviceRawDataMeasurements(command.DeviceId);

                if (processDeviceRawDataMeasurementsResult != null)
                {
                    ProcessDeviceRawDataMeasurementsResponse processDeviceRawDataMeasurementsResponse = new ProcessDeviceRawDataMeasurementsResponse();
                    processDeviceRawDataMeasurementsResponse.TotalMeasurements = processDeviceRawDataMeasurementsResult;
                    return new Response<ProcessDeviceRawDataMeasurementsResponse>(processDeviceRawDataMeasurementsResponse);
                }
                return new Response<ProcessDeviceRawDataMeasurementsResponse>(new Exception("Object returned is null"));
            }
            catch (Exception ex)
            {
                return new Response<ProcessDeviceRawDataMeasurementsResponse>(ex);
            }
        }
    }
}
