using AgriSmart.Application.Agronomic.Commands;
using AgriSmart.Application.Agronomic.Mappers;
using AgriSmart.Application.Agronomic.Responses.Commands;
using AgriSmart.Core.Entities;
using AgriSmart.Core.Repositories.Commands;
using AgriSmart.Core.Responses;
using MediatR;

namespace AgriSmart.Application.Agronomic.Handlers.Commands
{
    public class DeleteCropProductionIrrigationSectorCommandHandler : IRequestHandler<DeleteCropProductionIrrigationSectorCommand, Response<DeleteCropProductionIrrigationSectorResponse>>
    {
        private readonly ICropProductionIrrigationSectorCommandRepository _cropProductionIrrigationSectorCommandRepository;

        public DeleteCropProductionIrrigationSectorCommandHandler(ICropProductionIrrigationSectorCommandRepository cropProductionIrrigationSectorCommandRepository)
        {
            _cropProductionIrrigationSectorCommandRepository = cropProductionIrrigationSectorCommandRepository;
        }

        public async Task<Response<DeleteCropProductionIrrigationSectorResponse>> Handle(DeleteCropProductionIrrigationSectorCommand command, CancellationToken cancellationToken)
        {
            try
            {
                CropProductionIrrigationSector deleteCropProductionIrrigationSector = AgronomicMapper.Mapper.Map<CropProductionIrrigationSector>(command);

                await _cropProductionIrrigationSectorCommandRepository.DeleteAsync(deleteCropProductionIrrigationSector);

                return new Response<DeleteCropProductionIrrigationSectorResponse>(new DeleteCropProductionIrrigationSectorResponse { Id = command.Id });
            }
            catch (Exception ex)
            {
                return new Response<DeleteCropProductionIrrigationSectorResponse>(ex);
            }
        }
    }
}