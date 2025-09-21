using AgriSmart.Application.Agronomic.Commands;
using AgriSmart.Application.Agronomic.Mappers;
using AgriSmart.Application.Agronomic.Responses.Commands;
using AgriSmart.Core.Entities;
using AgriSmart.Core.Repositories.Commands;
using AgriSmart.Core.Responses;
using MediatR;

namespace AgriSmart.Application.Agronomic.Handlers.Commands
{
    public class DeleteIrrigationEventCommandHandler : IRequestHandler<DeleteIrrigationEventCommand, Response<DeleteIrrigationEventResponse>>
    {
        private readonly IIrrigationEventCommandRepository _irrigationEventCommandRepository;

        public DeleteIrrigationEventCommandHandler(IIrrigationEventCommandRepository irrigationEventCommandRepository)
        {
            _irrigationEventCommandRepository = irrigationEventCommandRepository;
        }

        public async Task<Response<DeleteIrrigationEventResponse>> Handle(DeleteIrrigationEventCommand command, CancellationToken cancellationToken)
        {
            try
            {
                IrrigationEvent deleteIrrigationEvent = AgronomicMapper.Mapper.Map<IrrigationEvent>(command);

                await _irrigationEventCommandRepository.DeleteAsync(deleteIrrigationEvent);

                return new Response<DeleteIrrigationEventResponse>(new DeleteIrrigationEventResponse { Id = command.Id });
            }
            catch (Exception ex)
            {
                return new Response<DeleteIrrigationEventResponse>(ex);
            }
        }
    }
}