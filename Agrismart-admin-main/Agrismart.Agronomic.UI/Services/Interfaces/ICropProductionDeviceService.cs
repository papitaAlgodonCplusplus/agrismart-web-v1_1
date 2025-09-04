using Agrismart.Agronomic.UI.Services.Requests.Commands;
using Agrismart.Agronomic.UI.Services.Requests.Queries;
using Agrismart.Agronomic.UI.Services.Responses;

namespace Agrismart.Agronomic.UI.Services.Interfaces
{
    public interface ICropProductionDeviceService
    {
        Task<GetAllCropProductionDevicesResponse> GetAll(GetAllCropProductionDevicesRequest request);
        Task<CropProductionDeviceResponse> Create(CreateCropProductionDeviceRequest request);
        Task<CropProductionDeviceResponse> Delete(DeleteCropProductionDeviceRequest request);
    }
}