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
    public class CreateSensorHandler : IRequestHandler<CreateSensorCommand, Response<CreateSensorResponse>>
    {
        private readonly ISensorCommandRepository _sensorCommandRepository;

        public CreateSensorHandler(ISensorCommandRepository sensorCommandRepository)
        {
            _sensorCommandRepository = sensorCommandRepository;
        }

        public async Task<Response<CreateSensorResponse>> Handle(CreateSensorCommand command, CancellationToken cancellationToken)
        {
            try
            {
                using (CreateSensorValidator validator = new CreateSensorValidator())
                {
                    var errors = validator.Validate(command);
                    if (!string.IsNullOrWhiteSpace(errors.ToString()))
                        return new Response<CreateSensorResponse>(new Exception(errors.ToString()));
                }

                int sessionUserId = _sensorCommandRepository.GetSessionUserId();
                int sessionProfileId = _sensorCommandRepository.GetSessionProfileId();
                Sensor newSensor = AgronomicMapper.Mapper.Map<Sensor>(command);

                newSensor.CreatedBy = sessionUserId;
                newSensor.Active = true;

                var createSensorResult = await _sensorCommandRepository.CreateAsync(newSensor);

                if (createSensorResult != null)
                {
                    CreateSensorResponse createSensorResponse = AgronomicMapper.Mapper.Map<CreateSensorResponse>(createSensorResult);

                    return new Response<CreateSensorResponse>(createSensorResponse);
                }
                return new Response<CreateSensorResponse>(new Exception("Object returned is null"));
            }
            catch (Exception ex)
            {
                return new Response<CreateSensorResponse>(ex);
            }
        }
    }
}
