using AgriSmart.Application.Agronomic.Commands;
using AgriSmart.Application.Agronomic.Responses.Commands;
using AgriSmart.Application.Agronomic.Validators.Commands;
using AgriSmart.Core.Entities;
using AgriSmart.Core.Repositories.Commands;
using AgriSmart.Core.Repositories.Queries;
using AgriSmart.Core.Responses;
using MediatR;

namespace AgriSmart.Application.Agronomic.Handlers.Commands
{
    public class UpdateSensorHandler : IRequestHandler<UpdateSensorCommand, Response<UpdateSensorResponse>>
    {
        private readonly ISensorCommandRepository _sensorCommandRepository;
        private readonly ISensorQueryRepository _sensorQueryRepository;

        public UpdateSensorHandler(ISensorCommandRepository sensorCommandRepository, ISensorQueryRepository sensorQueryRepository)
        {
            _sensorCommandRepository = sensorCommandRepository;
            _sensorQueryRepository = sensorQueryRepository;
        }

        public async Task<Response<UpdateSensorResponse>> Handle(UpdateSensorCommand command, CancellationToken cancellationToken)
        {
            try
            {
                using (UpdateSensorValidator validator = new UpdateSensorValidator())
                {
                    var errors = validator.Validate(command);
                    if (!string.IsNullOrWhiteSpace(errors.ToString()))
                        return new Response<UpdateSensorResponse>(new Exception(errors.ToString()));
                }

                Sensor getResult = await _sensorQueryRepository.GetByIdAsync(command.Id);

                if (getResult != null)
                {
                    getResult.DeviceId = command.DeviceId;
                    getResult.SensorLabel = command.SensorLabel;
                    getResult.Description = command.Description;
                    getResult.MeasurementVariableId =  command.MeasurementVariableId;
                    getResult.NumberOfContainers = command.NumberOfContainers;
                    getResult.Active = command.Active;
                }

                Sensor updateSensorResult = await _sensorCommandRepository.UpdateAsync(getResult);

                if (updateSensorResult != null)
                {
                    UpdateSensorResponse updateSensorResponse  = new UpdateSensorResponse()
                    {
                        Id = updateSensorResult.Id,
                        DeviceId = updateSensorResult.DeviceId,
                        SensorLabel = updateSensorResult.SensorLabel,
                        Description = updateSensorResult.Description,
                        MeasurementVariableId = updateSensorResult.MeasurementVariableId,   
                        NumberOfContainers = updateSensorResult.NumberOfContainers,
                        Active = updateSensorResult.Active
                    };

                    return new Response<UpdateSensorResponse>(updateSensorResponse);
                }
                return new Response<UpdateSensorResponse>(new Exception("Object returned is null"));
            }
            catch (Exception ex)
            {
                return new Response<UpdateSensorResponse>(ex);
            }
        }
    }
}
