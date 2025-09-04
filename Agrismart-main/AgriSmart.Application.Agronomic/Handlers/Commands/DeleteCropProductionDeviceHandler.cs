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
    public class DeleteCropProductionDeviceHandler : IRequestHandler<DeleteCropProductionDeviceCommand, Response<DeleteCropProductionDeviceResponse>>
    {
        private readonly ICropProductionDeviceCommandRepository _cropProductionDeviceCommandRepository;

        public DeleteCropProductionDeviceHandler(ICropProductionDeviceCommandRepository cropProductionDeviceCommandRepository)
        {
            _cropProductionDeviceCommandRepository = cropProductionDeviceCommandRepository;            
        }

        public async Task<Response<DeleteCropProductionDeviceResponse>> Handle(DeleteCropProductionDeviceCommand command, CancellationToken cancellationToken)
        {
            try
            {
                using (DeleteCropProductionDeviceValidator validator = new DeleteCropProductionDeviceValidator())
                {
                    var errors = validator.Validate(command);
                    if (!string.IsNullOrWhiteSpace(errors.ToString()))
                        return new Response<DeleteCropProductionDeviceResponse>(new Exception(errors.ToString()));
                }

                CropProductionDevice deleteCropProductionDevice = AgronomicMapper.Mapper.Map<CropProductionDevice>(command);

                await _cropProductionDeviceCommandRepository.DeleteAsync(deleteCropProductionDevice);

                return new Response<DeleteCropProductionDeviceResponse>(new DeleteCropProductionDeviceResponse());
            }
            catch (Exception ex)
            {
                return new Response<DeleteCropProductionDeviceResponse>(ex);
            }
        }
    }
}
