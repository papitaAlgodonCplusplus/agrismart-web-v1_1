using Agrismart.Agronomic.UI.Services.Requests.Commands;
using Agrismart.Agronomic.UI.Services.Requests.Queries;
using Agrismart.Agronomic.UI.Services.Responses;

namespace Agrismart.Agronomic.UI.Services.Interfaces
{
    public interface IDeviceService
    {
        Task<GetAllDevicesResponse> GetAll(GetAllDevicesRequest request);
        Task<DeviceResponse> Create(CreateDeviceRequest request);
        Task<DeviceResponse> Update(UpdateDeviceRequest request);
    }
}
