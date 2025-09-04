using Agrismart.Agronomic.UI.Services.Requests.Commands;
using Agrismart.Agronomic.UI.Services.Requests.Queries;
using Agrismart.Agronomic.UI.Services.Responses;

namespace Agrismart.Agronomic.UI.Services.Interfaces
{
    public interface ISensorService
    {
        Task<GetAllSensorsResponse> GetAll(GetAllSensorsRequest request);
        Task<SensorResponse> Create(CreateSensorRequest request);
        Task<SensorResponse> Update(UpdateSensorRequest request);
    }
}
 