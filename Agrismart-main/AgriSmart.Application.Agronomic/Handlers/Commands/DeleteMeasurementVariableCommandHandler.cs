using AgriSmart.Application.Agronomic.Commands;
using AgriSmart.Application.Agronomic.Mappers;
using AgriSmart.Application.Agronomic.Responses.Commands;
using AgriSmart.Core.Entities;
using AgriSmart.Core.Repositories.Commands;
using AgriSmart.Core.Responses;
using MediatR;

namespace AgriSmart.Application.Agronomic.Handlers.Commands
{
    public class DeleteMeasurementVariableCommandHandler : IRequestHandler<DeleteMeasurementVariableCommand, Response<DeleteMeasurementVariableResponse>>
    {
        private readonly IMeasurementVariableCommandRepository _measurementVariableCommandRepository;

        public DeleteMeasurementVariableCommandHandler(IMeasurementVariableCommandRepository measurementVariableCommandRepository)
        {
            _measurementVariableCommandRepository = measurementVariableCommandRepository;
        }

        public async Task<Response<DeleteMeasurementVariableResponse>> Handle(DeleteMeasurementVariableCommand command, CancellationToken cancellationToken)
        {
            try
            {
                MeasurementVariable deleteMeasurementVariable = AgronomicMapper.Mapper.Map<MeasurementVariable>(command);

                await _measurementVariableCommandRepository.DeleteAsync(deleteMeasurementVariable);

                return new Response<DeleteMeasurementVariableResponse>(new DeleteMeasurementVariableResponse { Id = command.Id });
            }
            catch (Exception ex)
            {
                return new Response<DeleteMeasurementVariableResponse>(ex);
            }
        }
    }
}