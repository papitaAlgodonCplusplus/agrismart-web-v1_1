using Agrismart.Agronomic.UI.Services.Requests.Commands;
using Agrismart.Agronomic.UI.Services.Requests.Queries;
using Agrismart.Agronomic.UI.Services.Responses;

namespace Agrismart.Agronomic.UI.Services.Interfaces
{
    public interface IUserFarmService
    {
        Task<GetAllUserFarmsResponse> GetAll(GetAllUserFarmsRequest request);
        Task<UserFarmResponse> Create(CreateUserFarmRequest request);
        Task<UserFarmResponse> Delete(DeleteUserFarmRequest request);
    }
} 