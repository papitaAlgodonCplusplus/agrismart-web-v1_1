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
    public class UpdateMeasurementVariableHandler : IRequestHandler<UpdateMeasurementVariableCommand, Response<UpdateMeasurementVariablerResponse>>
    {
        private readonly IMeasurementVariableCommandRepository _measurementVariableCommandRepository;
        private readonly IMeasurementVariableQueryRepository _measurementVariableQueryRepository;

        public UpdateMeasurementVariableHandler(IMeasurementVariableCommandRepository measurementVariableCommandRepository, IMeasurementVariableQueryRepository measurementVariableQueryRepository)
        {
            _measurementVariableCommandRepository = measurementVariableCommandRepository;
            _measurementVariableQueryRepository = measurementVariableQueryRepository;            
        }

        public async Task<Response<UpdateMeasurementVariablerResponse>> Handle(UpdateMeasurementVariableCommand command, CancellationToken cancellationToken)
        {
            try
            {
                using (UpdateMeasurementVariableValidator validator = new UpdateMeasurementVariableValidator())
                {
                    var errors = validator.Validate(command);
                    if (!string.IsNullOrWhiteSpace(errors.ToString()))
                        return new Response<UpdateMeasurementVariablerResponse>(new Exception(errors.ToString()));
                }

                MeasurementVariable getResult = await _measurementVariableQueryRepository.GetByIdAsync(command.Id);

                if (getResult != null)
                {
                    getResult.MeasurementVariableStandardId = command.MeasurementVariableStandardId;
                    getResult.CatalogId = command.CatalogId;
                    getResult.Name = command.Name;
                    getResult.MeasurementUnitId = command.MeasurementUnitId;
                    getResult.FactorToMeasurementVariableStandard = command.FactorToMeasurementVariableStandard;
                    getResult.Active = command.Active;
                }

                MeasurementVariable updateMeasurementVariableResult = await _measurementVariableCommandRepository.UpdateAsync(getResult);

                if (updateMeasurementVariableResult != null)
                {
                    UpdateMeasurementVariablerResponse updateMeasurementVariableResponse = new UpdateMeasurementVariablerResponse()
                    {
                        Id = updateMeasurementVariableResult.Id,
                        MeasurementVariableStandardId = updateMeasurementVariableResult.MeasurementVariableStandardId,
                        CatalogId = updateMeasurementVariableResult.CatalogId,
                        Name = updateMeasurementVariableResult.Name,
                        MeasurementUnitId = updateMeasurementVariableResult.MeasurementUnitId,
                        FactorToMeasurementVariableStandard = updateMeasurementVariableResult.FactorToMeasurementVariableStandard,
                        Active = updateMeasurementVariableResult.Active
                    };

                    return new Response<UpdateMeasurementVariablerResponse>(updateMeasurementVariableResponse);
                }
                return new Response<UpdateMeasurementVariablerResponse>(new Exception("Object returned is null"));
            }
            catch (Exception ex)
            {
                return new Response<UpdateMeasurementVariablerResponse>(ex);
            }
        }
    }
}
