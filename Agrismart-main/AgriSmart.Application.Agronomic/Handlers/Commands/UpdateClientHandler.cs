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
    public class UpdateClientHandler : IRequestHandler<UpdateClientCommand, Response<UpdateClientResponse>>
    {
        private readonly IClientCommandRepository _clientCommandRepository;
        private readonly IClientQueryRepository _clientQueryRepository;

        public UpdateClientHandler(IClientCommandRepository clientCommandRepository, IClientQueryRepository clientQueryRepository)
        {
            _clientCommandRepository = clientCommandRepository;
            _clientQueryRepository = clientQueryRepository;            
        }

        public async Task<Response<UpdateClientResponse>> Handle(UpdateClientCommand command, CancellationToken cancellationToken)
        {
            try
            {
                using (UpdateClientValidator validator = new UpdateClientValidator())
                {
                    var errors = validator.Validate(command);
                    if (!string.IsNullOrWhiteSpace(errors.ToString()))
                        return new Response<UpdateClientResponse>(new Exception(errors.ToString()));
                }

                Client getResult = await _clientQueryRepository.GetByIdAsync(command.Id);

                if (getResult != null)
                {
                    getResult.Name = command.Name;
                    getResult.Description = command.Description;
                    getResult.Active = command.Active;
                }

                Client updateClientResult = await _clientCommandRepository.UpdateAsync(getResult);

                if (updateClientResult != null)
                {
                    UpdateClientResponse updateClientResponse = AgronomicMapper.Mapper.Map<UpdateClientResponse>(updateClientResult);

                    return new Response<UpdateClientResponse>(updateClientResponse);
                }
                return new Response<UpdateClientResponse>(new Exception("Object returned is null"));
            }
            catch (Exception ex)
            {
                return new Response<UpdateClientResponse>(ex);
            }
        }
    }
}
