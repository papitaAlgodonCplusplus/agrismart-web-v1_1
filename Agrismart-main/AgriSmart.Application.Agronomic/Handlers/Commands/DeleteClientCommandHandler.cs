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
    public class DeleteClientCommandHandler : IRequestHandler<DeleteClientCommand, Response<DeleteClientResponse>>
    {
        private readonly IClientCommandRepository _clientCommandRepository;

        public DeleteClientCommandHandler(IClientCommandRepository clientCommandRepository)
        {
            _clientCommandRepository = clientCommandRepository;
        }

        public async Task<Response<DeleteClientResponse>> Handle(DeleteClientCommand command, CancellationToken cancellationToken)
        {
            try
            {
                using (DeleteClientValidator validator = new DeleteClientValidator())
                {
                    var errors = validator.Validate(command);
                    if (!string.IsNullOrWhiteSpace(errors.ToString()))
                        return new Response<DeleteClientResponse>(new Exception(errors.ToString()));
                }

                Client deleteClient = AgronomicMapper.Mapper.Map<Client>(command);

                await _clientCommandRepository.DeleteAsync(deleteClient);

                return new Response<DeleteClientResponse>(new DeleteClientResponse { Id = command.Id });
            }
            catch (Exception ex)
            {
                return new Response<DeleteClientResponse>(ex);
            }
        }
    }
}