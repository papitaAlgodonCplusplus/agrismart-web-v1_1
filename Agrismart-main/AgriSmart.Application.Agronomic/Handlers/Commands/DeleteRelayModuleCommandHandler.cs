using AgriSmart.Application.Agronomic.Commands;
using AgriSmart.Application.Agronomic.Mappers;
using AgriSmart.Application.Agronomic.Responses.Commands;
using AgriSmart.Core.Entities;
using AgriSmart.Core.Repositories.Commands;
using AgriSmart.Core.Responses;
using MediatR;

namespace AgriSmart.Application.Agronomic.Handlers.Commands
{
    public class DeleteRelayModuleCommandHandler : IRequestHandler<DeleteRelayModuleCommand, Response<DeleteRelayModuleResponse>>
    {
        private readonly IRelayModuleCommandRepository _relayModuleCommandRepository;

        public DeleteRelayModuleCommandHandler(IRelayModuleCommandRepository relayModuleCommandRepository)
        {
            _relayModuleCommandRepository = relayModuleCommandRepository;
        }

        public async Task<Response<DeleteRelayModuleResponse>> Handle(DeleteRelayModuleCommand command, CancellationToken cancellationToken)
        {
            try
            {
                RelayModule deleteRelayModule = AgronomicMapper.Mapper.Map<RelayModule>(command);

                await _relayModuleCommandRepository.DeleteAsync(deleteRelayModule);

                return new Response<DeleteRelayModuleResponse>(new DeleteRelayModuleResponse { Id = command.Id });
            }
            catch (Exception ex)
            {
                return new Response<DeleteRelayModuleResponse>(ex);
            }
        }
    }
}