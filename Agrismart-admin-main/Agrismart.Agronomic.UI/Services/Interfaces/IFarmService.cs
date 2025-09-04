using Agrismart.Agronomic.UI.Services.Requests.Commands;
using Agrismart.Agronomic.UI.Services.Requests.Queries;
using Agrismart.Agronomic.UI.Services.Responses;

namespace Agrismart.Agronomic.UI.Services.Interfaces
{
    public interface IFarmService
    {
        Task<GetAllFarmsResponse> GetAll(GetAllFarmsRequest request);
        Task<FarmResponse> Create(CreateFarmRequest request);
        Task<FarmResponse> Update(UpdateFarmRequest request);
    }
}
