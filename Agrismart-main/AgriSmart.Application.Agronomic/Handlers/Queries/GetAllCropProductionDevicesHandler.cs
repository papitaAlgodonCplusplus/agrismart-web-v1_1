using AgriSmart.Application.Agronomic.Queries;
using AgriSmart.Application.Agronomic.Responses.Queries;
using AgriSmart.Application.Agronomic.Validators.Queries;
using AgriSmart.Core.Repositories.Queries;
using AgriSmart.Core.Responses;
using MediatR;

namespace AgriSmart.Application.Agronomic.Handlers.Queries
{
    public class GetAllCropProductionDevicesHandler : IRequestHandler<GetAllCropProductionDevicesQuery, Response<GetAllCropProductionDevicesResponse>>
    {
        private readonly ICropProductionDeviceQueryRepository _cropProductionDeviceQueryRepository;

        public GetAllCropProductionDevicesHandler(ICropProductionDeviceQueryRepository cropProductionDeviceQueryRepository)
        {
            _cropProductionDeviceQueryRepository = cropProductionDeviceQueryRepository;             
        }

        public async Task<Response<GetAllCropProductionDevicesResponse>> Handle(GetAllCropProductionDevicesQuery query, CancellationToken cancellationToken)
        {
            try
            {
                using (GetAllCropProductionDevicesValidator validator = new GetAllCropProductionDevicesValidator())
                {
                    var errors = validator.Validate(query);
                    if (!string.IsNullOrWhiteSpace(errors.ToString()))
                        return new Response<GetAllCropProductionDevicesResponse>(new Exception(errors.ToString()));
                }

                var getAllResult = await _cropProductionDeviceQueryRepository.GetAllAsync(query.CropProductionId);

                if (getAllResult != null)
                {
                    GetAllCropProductionDevicesResponse getAllCropProductionDevicesResponse = new GetAllCropProductionDevicesResponse();
                    getAllCropProductionDevicesResponse.CropProductionDevices = getAllResult;
                    return new Response<GetAllCropProductionDevicesResponse>(getAllCropProductionDevicesResponse);
                }
                return new Response<GetAllCropProductionDevicesResponse>(new Exception("Object returned is null"));
            }
            catch (Exception ex)
            {
                return new Response<GetAllCropProductionDevicesResponse>(ex);
            }
        }
    }
}
