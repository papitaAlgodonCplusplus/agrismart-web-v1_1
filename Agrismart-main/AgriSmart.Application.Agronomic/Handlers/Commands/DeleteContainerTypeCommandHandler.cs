using AgriSmart.Application.Agronomic.Commands;
using AgriSmart.Application.Agronomic.Responses.Commands;
using AgriSmart.Core.Entities;
using AgriSmart.Core.Repositories.Commands;
using AgriSmart.Core.Responses;
using MediatR;

namespace AgriSmart.Application.Agronomic.Handlers.Commands
{
    public class DeleteContainerTypeCommandHandler : IRequestHandler<DeleteContainerTypeCommand, Response<DeleteContainerTypeResponse>>
    {
        private readonly IContainerTypeCommandRepository _containerTypeCommandRepository;

        public DeleteContainerTypeCommandHandler(IContainerTypeCommandRepository containerTypeCommandRepository)
        {
            _containerTypeCommandRepository = containerTypeCommandRepository;
        }

        public async Task<Response<DeleteContainerTypeResponse>> Handle(DeleteContainerTypeCommand command, CancellationToken cancellationToken)
        {
            try
            {
                await _containerTypeCommandRepository.DeleteAsync(new ContainerType { Id = command.Id });
                return new Response<DeleteContainerTypeResponse>(new DeleteContainerTypeResponse { Id = command.Id });
            }
            catch (Exception ex)
            {
                return new Response<DeleteContainerTypeResponse>(ex);
            }
        }
    }
}
