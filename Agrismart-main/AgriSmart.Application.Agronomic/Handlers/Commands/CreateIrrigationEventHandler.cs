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
    public class CreateIrrigationEventHandler : IRequestHandler<CreateIrrigationEventCommand, Response<CreateIrrigationEventResponse>>
    {
        private readonly IIrrigationEventCommandRepository _irrigationEventCommandRepository;

        public CreateIrrigationEventHandler(IIrrigationEventCommandRepository irrigationEventCommandRepository)
        {
            _irrigationEventCommandRepository = irrigationEventCommandRepository;
        }

        public async Task<Response<CreateIrrigationEventResponse>> Handle(CreateIrrigationEventCommand command, CancellationToken cancellationToken)
        {
            try
            {
                using (CreateIrrigationEventValidator validator = new CreateIrrigationEventValidator())
                {
                    var errors = validator.Validate(command);
                    if (!string.IsNullOrWhiteSpace(errors.ToString()))
                        return new Response<CreateIrrigationEventResponse>(new Exception(errors.ToString()));
                }

                IrrigationEvent newObject = AgronomicMapper.Mapper.Map<IrrigationEvent>(command);

                foreach (CreateIrrigationEventMeasurementCommand createIrrigationEventMeasurementCommand in command.CreateIrrigationEventMeasurements)
                {
                    IrrigationMeasurement newMeasurement = new IrrigationMeasurement()
                    {
                        Id = createIrrigationEventMeasurementCommand.Id,
                        EventId = createIrrigationEventMeasurementCommand.EventId,
                        MeasurementVariableId = createIrrigationEventMeasurementCommand.MeasurementVariableId,
                        RecordValue = createIrrigationEventMeasurementCommand.RecordValue
                    };

                    if (newObject.IrrigationMeasurements == null)
                        newObject.IrrigationMeasurements = new List<IrrigationMeasurement>();

                    //IrrigationMeasurement newMeasurement = AgronomicMapper.Mapper.Map<IrrigationMeasurement>(createIrrigationEventMeasurementCommand);
                    newObject.IrrigationMeasurements.Add(newMeasurement);
                }

                var createObjectResult = await _irrigationEventCommandRepository.CreateAsync(newObject);
                if (createObjectResult != null)
                {
                    CreateIrrigationEventResponse createObjectResponse = AgronomicMapper.Mapper.Map<CreateIrrigationEventResponse>(createObjectResult);
                    return new Response<CreateIrrigationEventResponse>(createObjectResponse);
                }
                return new Response<CreateIrrigationEventResponse>(new Exception("Object returned is null"));
            }
            catch (Exception ex)
            {
                return new Response<CreateIrrigationEventResponse>(ex);
            }
        }
    }
}
