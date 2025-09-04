using AgriSmart.Application.Agronomic.Commands;
using AgriSmart.Application.Agronomic.Mappers;
using AgriSmart.Application.Agronomic.Responses.Commands;
using AgriSmart.Application.Agronomic.Validators.Commands;
using AgriSmart.Core.Entities;
using AgriSmart.Core.Repositories.Commands;
using AgriSmart.Core.Repositories.Queries;
using AgriSmart.Core.Responses;
using MediatR;

namespace AgriSmart.Application.Agronomic.Handlers.Commands
{
    public class UpdateRelayModuleHandler : IRequestHandler<UpdateRelayModuleCommand, Response<UpdateRelayModuleResponse>>
    {
        private readonly IRelayModuleCommandRepository _relayModuleCommandRepository;
        private readonly IRelayModuleQueryRepository _relayModuleQueryRepository;

        public UpdateRelayModuleHandler(IRelayModuleCommandRepository relayModuleCommandRepository, IRelayModuleQueryRepository relayModuleQueryRepository)
        {
            _relayModuleCommandRepository = relayModuleCommandRepository;
            _relayModuleQueryRepository = relayModuleQueryRepository;            
        }

        public async Task<Response<UpdateRelayModuleResponse>> Handle(UpdateRelayModuleCommand command, CancellationToken cancellationToken)
        {
            try
            {
                using (UpdateRelayModuleValidator validator = new UpdateRelayModuleValidator())
                {
                    var errors = validator.Validate(command);
                    if (!string.IsNullOrWhiteSpace(errors.ToString()))
                        return new Response<UpdateRelayModuleResponse>(new Exception(errors.ToString()));
                }

                RelayModule getResult = await _relayModuleQueryRepository.GetByIdAsync(command.Id);

                if (getResult != null)
                {
                    getResult.Name = command.Name;
                    getResult.Active = command.Active;
                }

                RelayModule updateRelayModuleResult = await _relayModuleCommandRepository.UpdateAsync(getResult);

                if (updateRelayModuleResult != null)
                {
                    UpdateRelayModuleResponse updateRelayModuleResponse = AgronomicMapper.Mapper.Map<UpdateRelayModuleResponse>(updateRelayModuleResult);

                    return new Response<UpdateRelayModuleResponse>(updateRelayModuleResponse);
                }
                return new Response<UpdateRelayModuleResponse>(new Exception("Object returned is null"));
            }
            catch (Exception ex)
            {
                return new Response<UpdateRelayModuleResponse>(ex);
            }
        }
    }
}
