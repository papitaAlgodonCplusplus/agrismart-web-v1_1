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
    public class CreateMeasurementVariableHandler : IRequestHandler<CreateMeasurementVariableCommand, Response<CreateMeasurementVariableResponse>>
    {
        private readonly IMeasurementVariableCommandRepository _measurementVariableCommandRepository;

        public CreateMeasurementVariableHandler(IMeasurementVariableCommandRepository measurementVariableCommandRepository)
        {
            _measurementVariableCommandRepository = measurementVariableCommandRepository;
        }

        public async Task<Response<CreateMeasurementVariableResponse>> Handle(CreateMeasurementVariableCommand command, CancellationToken cancellationToken)
        {
            try
            {
                using (CreateMeasurementVariableValidator validator = new CreateMeasurementVariableValidator())
                {
                    var errors = validator.Validate(command);
                    if (!string.IsNullOrWhiteSpace(errors.ToString()))
                        return new Response<CreateMeasurementVariableResponse>(new Exception(errors.ToString()));
                }

                int sessionUserId = _measurementVariableCommandRepository.GetSessionUserId();
                int sessionProfileId = _measurementVariableCommandRepository.GetSessionProfileId();
                MeasurementVariable newMeasurementVariable = AgronomicMapper.Mapper.Map<MeasurementVariable>(command);

                newMeasurementVariable.CreatedBy = sessionUserId;
                newMeasurementVariable.Active = true;

                var createMeasurementVariableResult = await _measurementVariableCommandRepository.CreateAsync(newMeasurementVariable);

                if (createMeasurementVariableResult != null)
                {
                    CreateMeasurementVariableResponse createMeasurementVariableResponse = AgronomicMapper.Mapper.Map<CreateMeasurementVariableResponse>(createMeasurementVariableResult);

                    return new Response<CreateMeasurementVariableResponse>(createMeasurementVariableResponse);
                }
                return new Response<CreateMeasurementVariableResponse>(new Exception("Object returned is null"));
            }
            catch (Exception ex)
            {
                return new Response<CreateMeasurementVariableResponse>(ex);
            }
        }
    }
}
