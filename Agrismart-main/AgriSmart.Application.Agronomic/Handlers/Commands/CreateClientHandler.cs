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
    public class CreateClientHandler : IRequestHandler<CreateClientCommand, Response<CreateClientResponse>>
    {
        private readonly IClientCommandRepository _clientCommandRepository;


        public CreateClientHandler(IClientCommandRepository clientCommandRepository)
        {
            _clientCommandRepository = clientCommandRepository;
        }

        public async Task<Response<CreateClientResponse>> Handle(CreateClientCommand command, CancellationToken cancellationToken)
        {
            try
            {
                using (CreateClientValidator validator = new CreateClientValidator())
                {
                    var errors = validator.Validate(command);
                    if (!string.IsNullOrWhiteSpace(errors.ToString()))
                        return new Response<CreateClientResponse>(new Exception(errors.ToString()));
                }   

                Client newObject = AgronomicMapper.Mapper.Map<Client>(command);
                newObject.CreatedBy = _clientCommandRepository.GetSessionUserId(); 
                newObject.Active = true;

                var createObjectResult = await _clientCommandRepository.CreateAsync(newObject);
                if (createObjectResult != null)
                {                    
                    CreateClientResponse createObjectResponse = AgronomicMapper.Mapper.Map<CreateClientResponse>(createObjectResult);
                    return new Response<CreateClientResponse>(createObjectResponse);
                }
                return new Response<CreateClientResponse>(new Exception("Object returned is null"));
            }
            catch (Exception ex)
            {
                return new Response<CreateClientResponse>(ex);
            }
        }
    }
}
