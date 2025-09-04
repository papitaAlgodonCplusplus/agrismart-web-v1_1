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
    public class CreateRelayModuleHandler : IRequestHandler<CreateRelayModuleCommand, Response<CreateRelayModuleResponse>>
    {
        private readonly IRelayModuleCommandRepository _relayModuleCommandRepository;


        public CreateRelayModuleHandler(IRelayModuleCommandRepository relayModuleCommandRepository)
        {
            _relayModuleCommandRepository = relayModuleCommandRepository;
        }

        public async Task<Response<CreateRelayModuleResponse>> Handle(CreateRelayModuleCommand command, CancellationToken cancellationToken)
        {
            try
            {
                using (CreateRelayModuleValidator validator = new CreateRelayModuleValidator())
                {
                    var errors = validator.Validate(command);
                    if (!string.IsNullOrWhiteSpace(errors.ToString()))
                        return new Response<CreateRelayModuleResponse>(new Exception(errors.ToString()));
                }   

                RelayModule newObject = AgronomicMapper.Mapper.Map<RelayModule>(command);
                newObject.CreatedBy = _relayModuleCommandRepository.GetSessionUserId(); 
                newObject.Active = true;

                var createObjectResult = await _relayModuleCommandRepository.CreateAsync(newObject);
                if (createObjectResult != null)
                {                    
                    CreateRelayModuleResponse createObjectResponse = AgronomicMapper.Mapper.Map<CreateRelayModuleResponse>(createObjectResult);
                    return new Response<CreateRelayModuleResponse>(createObjectResponse);
                }
                return new Response<CreateRelayModuleResponse>(new Exception("Object returned is null"));
            }
            catch (Exception ex)
            {
                return new Response<CreateRelayModuleResponse>(ex);
            }
        }
    }
}
