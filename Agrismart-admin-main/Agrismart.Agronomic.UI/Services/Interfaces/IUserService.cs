using Agrismart.Agronomic.UI.Services.Requests.Commands;
using Agrismart.Agronomic.UI.Services.Requests.Queries;
using Agrismart.Agronomic.UI.Services.Responses;

namespace Agrismart.Agronomic.UI.Services.Interfaces
{
    public interface IUserService
    {
        Task<GetAllUsersResponse> GetAll(GetAllUsersRequest request);
        Task<UserResponse> Create(CreateUserRequest request);
        Task<UserResponse> Update(UpdateUserRequest request);
    }
}
 