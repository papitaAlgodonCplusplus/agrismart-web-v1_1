using AgriSmart.Application.Agronomic.Commands;
using AgriSmart.Application.Agronomic.Mappers;
using AgriSmart.Application.Agronomic.Responses.Commands;
using AgriSmart.Core.Entities;
using AgriSmart.Core.Repositories.Commands;
using AgriSmart.Core.Responses;
using MediatR;

namespace AgriSmart.Application.Agronomic.Handlers.Commands
{
    public class DeleteCropPhaseCommandHandler : IRequestHandler<DeleteCropPhaseCommand, Response<DeleteCropPhaseResponse>>
    {
        private readonly ICropPhaseCommandRepository _cropPhaseCommandRepository;

        public DeleteCropPhaseCommandHandler(ICropPhaseCommandRepository cropPhaseCommandRepository)
        {
            _cropPhaseCommandRepository = cropPhaseCommandRepository;
        }

        public async Task<Response<DeleteCropPhaseResponse>> Handle(DeleteCropPhaseCommand command, CancellationToken cancellationToken)
        {
            try
            {
                CropPhase deleteCropPhase = AgronomicMapper.Mapper.Map<CropPhase>(command);

                await _cropPhaseCommandRepository.DeleteAsync(deleteCropPhase);

                return new Response<DeleteCropPhaseResponse>(new DeleteCropPhaseResponse { Id = command.Id });
            }
            catch (Exception ex)
            {
                return new Response<DeleteCropPhaseResponse>(ex);
            }
        }
    }
}