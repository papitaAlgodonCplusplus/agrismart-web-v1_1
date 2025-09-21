using AgriSmart.Application.Agronomic.Commands;
using AgriSmart.Application.Agronomic.Mappers;
using AgriSmart.Application.Agronomic.Responses.Commands;
using AgriSmart.Core.Entities;
using AgriSmart.Core.Repositories.Commands;
using AgriSmart.Core.Responses;
using MediatR;

namespace AgriSmart.Application.Agronomic.Handlers.Commands
{
    public class DeleteGrowingMediumCommandHandler : IRequestHandler<DeleteGrowingMediumCommand, Response<DeleteGrowingMediumResponse>>
    {
        private readonly IGrowingMediumCommandRepository _growingMediumCommandRepository;

        public DeleteGrowingMediumCommandHandler(IGrowingMediumCommandRepository growingMediumCommandRepository)
        {
            _growingMediumCommandRepository = growingMediumCommandRepository;
        }

        public async Task<Response<DeleteGrowingMediumResponse>> Handle(DeleteGrowingMediumCommand command, CancellationToken cancellationToken)
        {
            try
            {
                GrowingMedium deleteGrowingMedium = AgronomicMapper.Mapper.Map<GrowingMedium>(command);

                await _growingMediumCommandRepository.DeleteAsync(deleteGrowingMedium);

                return new Response<DeleteGrowingMediumResponse>(new DeleteGrowingMediumResponse { Id = command.Id });
            }
            catch (Exception ex)
            {
                return new Response<DeleteGrowingMediumResponse>(ex);
            }
        }
    }
}