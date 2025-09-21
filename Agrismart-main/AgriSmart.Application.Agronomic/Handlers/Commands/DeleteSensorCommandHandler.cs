using AgriSmart.Application.Agronomic.Commands;
using AgriSmart.Application.Agronomic.Mappers;
using AgriSmart.Application.Agronomic.Responses.Commands;
using AgriSmart.Core.Entities;
using AgriSmart.Core.Repositories.Commands;
using AgriSmart.Core.Responses;
using MediatR;

namespace AgriSmart.Application.Agronomic.Handlers.Commands
{
    public class DeleteSensorCommandHandler : IRequestHandler<DeleteSensorCommand, Response<DeleteSensorResponse>>
    {
        private readonly ISensorCommandRepository _sensorCommandRepository;

        public DeleteSensorCommandHandler(ISensorCommandRepository sensorCommandRepository)
        {
            _sensorCommandRepository = sensorCommandRepository;
        }

        public async Task<Response<DeleteSensorResponse>> Handle(DeleteSensorCommand command, CancellationToken cancellationToken)
        {
            try
            {
                Sensor deleteSensor = AgronomicMapper.Mapper.Map<Sensor>(command);

                await _sensorCommandRepository.DeleteAsync(deleteSensor);

                return new Response<DeleteSensorResponse>(new DeleteSensorResponse { Id = command.Id });
            }
            catch (Exception ex)
            {
                return new Response<DeleteSensorResponse>(ex);
            }
        }
    }
}