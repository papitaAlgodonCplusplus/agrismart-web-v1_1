using AgriSmart.Application.Agronomic.Commands;
using AgriSmart.Application.Agronomic.Mappers;
using AgriSmart.Application.Agronomic.Responses.Commands;
using AgriSmart.Core.Entities;
using AgriSmart.Core.Repositories.Commands;
using AgriSmart.Core.Responses;
using MediatR;

namespace AgriSmart.Application.Agronomic.Handlers.Commands
{
    public class DeleteCropProductionCommandHandler : IRequestHandler<DeleteCropProductionCommand, Response<DeleteCropProductionResponse>>
    {
        private readonly ICropProductionCommandRepository _cropProductionCommandRepository;

        public DeleteCropProductionCommandHandler(ICropProductionCommandRepository cropProductionCommandRepository)
        {
            _cropProductionCommandRepository = cropProductionCommandRepository;
        }

        public async Task<Response<DeleteCropProductionResponse>> Handle(DeleteCropProductionCommand command, CancellationToken cancellationToken)
        {
            try
            {
                CropProduction deleteCropProduction = AgronomicMapper.Mapper.Map<CropProduction>(command);

                await _cropProductionCommandRepository.DeleteAsync(deleteCropProduction);

                return new Response<DeleteCropProductionResponse>(new DeleteCropProductionResponse { Id = command.Id });
            }
            catch (Exception ex)
            {
                return new Response<DeleteCropProductionResponse>(ex);
            }
        }
    }
}