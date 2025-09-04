using Agrismart.Agronomic.UI.Services.Requests.Commands;
using Agrismart.Agronomic.UI.Services.Requests.Queries;
using Agrismart.Agronomic.UI.Services.Responses;

namespace Agrismart.Agronomic.UI.Services.Interfaces
{
    public interface IWaterService
    {
        Task<GetAllWatersResponse> GetAll(GetAllWatersRequest request);
        Task<WaterResponse> Create(CreateWaterRequest request);
        Task<WaterResponse> Update(UpdateWaterRequest request);
    }
}