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
    public class DeleteCropCommandHandler : IRequestHandler<DeleteCropCommand, Response<DeleteCropResponse>>
    {
        private readonly ICropCommandRepository _cropCommandRepository;

        public DeleteCropCommandHandler(ICropCommandRepository cropCommandRepository)
        {
            _cropCommandRepository = cropCommandRepository;
        }

        public async Task<Response<DeleteCropResponse>> Handle(DeleteCropCommand command, CancellationToken cancellationToken)
        {
            try
            {
                using (DeleteCropValidator validator = new DeleteCropValidator())
                {
                    var errors = validator.Validate(command);
                    if (!string.IsNullOrWhiteSpace(errors.ToString()))
                        return new Response<DeleteCropResponse>(new Exception(errors.ToString()));
                }

                Crop deleteCrop = AgronomicMapper.Mapper.Map<Crop>(command);

                await _cropCommandRepository.DeleteAsync(deleteCrop);

                return new Response<DeleteCropResponse>(new DeleteCropResponse { Id = command.Id });
            }
            catch (Exception ex)
            {
                return new Response<DeleteCropResponse>(ex);
            }
        }
    }
}