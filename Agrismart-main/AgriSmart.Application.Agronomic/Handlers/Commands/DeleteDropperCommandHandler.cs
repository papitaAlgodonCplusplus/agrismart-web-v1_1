using AgriSmart.Application.Agronomic.Commands;
using AgriSmart.Application.Agronomic.Mappers;
using AgriSmart.Application.Agronomic.Responses.Commands;
using AgriSmart.Core.Entities;
using AgriSmart.Core.Repositories.Commands;
using AgriSmart.Core.Responses;
using MediatR;

namespace AgriSmart.Application.Agronomic.Handlers.Commands
{
    public class DeleteDropperCommandHandler : IRequestHandler<DeleteDropperCommand, Response<DeleteDropperResponse>>
    {
        private readonly IDropperCommandRepository _dropperCommandRepository;

        public DeleteDropperCommandHandler(IDropperCommandRepository dropperCommandRepository)
        {
            _dropperCommandRepository = dropperCommandRepository;
        }

        public async Task<Response<DeleteDropperResponse>> Handle(DeleteDropperCommand command, CancellationToken cancellationToken)
        {
            try
            {
                Dropper deleteDropper = AgronomicMapper.Mapper.Map<Dropper>(command);

                await _dropperCommandRepository.DeleteAsync(deleteDropper);

                return new Response<DeleteDropperResponse>(new DeleteDropperResponse { Id = command.Id });
            }
            catch (Exception ex)
            {
                return new Response<DeleteDropperResponse>(ex);
            }
        }
    }
}