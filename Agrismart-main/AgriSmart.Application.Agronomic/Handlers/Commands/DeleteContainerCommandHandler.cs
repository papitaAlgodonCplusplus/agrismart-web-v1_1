using AgriSmart.Application.Agronomic.Commands;
using AgriSmart.Application.Agronomic.Mappers;
using AgriSmart.Application.Agronomic.Responses.Commands;
using AgriSmart.Core.Entities;
using AgriSmart.Core.Repositories.Commands;
using AgriSmart.Core.Responses;
using MediatR;

namespace AgriSmart.Application.Agronomic.Handlers.Commands
{
    public class DeleteContainerCommandHandler : IRequestHandler<DeleteContainerCommand, Response<DeleteContainerResponse>>
    {
        private readonly IContainerCommandRepository _containerCommandRepository;

        public DeleteContainerCommandHandler(IContainerCommandRepository containerCommandRepository)
        {
            _containerCommandRepository = containerCommandRepository;
        }

        public async Task<Response<DeleteContainerResponse>> Handle(DeleteContainerCommand command, CancellationToken cancellationToken)
        {
            try
            {
                Container deleteContainer = AgronomicMapper.Mapper.Map<Container>(command);

                await _containerCommandRepository.DeleteAsync(deleteContainer);

                return new Response<DeleteContainerResponse>(new DeleteContainerResponse { Id = command.Id });
            }
            catch (Exception ex)
            {
                return new Response<DeleteContainerResponse>(ex);
            }
        }
    }
}