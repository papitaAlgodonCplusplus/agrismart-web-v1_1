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
    public class UpdateCropCommandHandler : IRequestHandler<UpdateCropCommand, Response<UpdateCropResponse>>
    {
        private readonly ICropCommandRepository _cropCommandRepository;

        public UpdateCropCommandHandler(ICropCommandRepository cropCommandRepository)
        {
            _cropCommandRepository = cropCommandRepository;
        }

        public async Task<Response<UpdateCropResponse>> Handle(UpdateCropCommand command, CancellationToken cancellationToken)
        {
            try
            {
                using (UpdateCropValidator validator = new UpdateCropValidator())
                {
                    var errors = validator.Validate(command);
                    if (!string.IsNullOrWhiteSpace(errors.ToString()))
                        return new Response<UpdateCropResponse>(new Exception(errors.ToString()));
                }

                int sessionUserId = _cropCommandRepository.GetSessionUserId();
                Crop updateCrop = AgronomicMapper.Mapper.Map<Crop>(command);

                updateCrop.UpdatedBy = sessionUserId;

                var updateCropResult = await _cropCommandRepository.UpdateAsync(updateCrop);

                if (updateCropResult != null)
                {
                    UpdateCropResponse updateCropResponse = AgronomicMapper.Mapper.Map<UpdateCropResponse>(updateCropResult);
                    return new Response<UpdateCropResponse>(updateCropResponse);
                }
                return new Response<UpdateCropResponse>(new Exception("Object returned is null"));
            }
            catch (Exception ex)
            {
                return new Response<UpdateCropResponse>(ex);
            }
        }
    }
}