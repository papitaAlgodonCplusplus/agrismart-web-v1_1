using AgriSmart.Application.Agronomic.Commands;
using AgriSmart.Application.Agronomic.Mappers;
using AgriSmart.Application.Agronomic.Responses.Commands;
using AgriSmart.Core.Entities;
using AgriSmart.Core.Repositories.Commands;
using AgriSmart.Core.Responses;
using MediatR;

namespace AgriSmart.Application.Agronomic.Handlers.Commands
{
    public class DeleteCropPhaseOptimalCommandHandler : IRequestHandler<DeleteCropPhaseOptimalCommand, Response<DeleteCropPhaseOptimalResponse>>
    {
        private readonly ICropPhaseOptimalCommandRepository _cropPhaseOptimalCommandRepository;

        public DeleteCropPhaseOptimalCommandHandler(ICropPhaseOptimalCommandRepository cropPhaseOptimalCommandRepository)
        {
            _cropPhaseOptimalCommandRepository = cropPhaseOptimalCommandRepository;
        }

        public async Task<Response<DeleteCropPhaseOptimalResponse>> Handle(DeleteCropPhaseOptimalCommand command, CancellationToken cancellationToken)
        {
            try
            {
                CropPhaseOptimal deleteCropPhaseOptimal = AgronomicMapper.Mapper.Map<CropPhaseOptimal>(command);

                await _cropPhaseOptimalCommandRepository.DeleteAsync(deleteCropPhaseOptimal);

                return new Response<DeleteCropPhaseOptimalResponse>(new DeleteCropPhaseOptimalResponse { Id = command.Id });
            }
            catch (Exception ex)
            {
                return new Response<DeleteCropPhaseOptimalResponse>(ex);
            }
        }
    }
}