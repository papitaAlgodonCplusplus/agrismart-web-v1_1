using Agrismart.Agronomic.UI.Services.Requests.Commands;
using Agrismart.Agronomic.UI.Services.Responses;

namespace Agrismart.Agronomic.UI.Services.Interfaces
{
    public interface IAuthenticationService
    {
        Task<LoginResponse> Login(LoginRequest request);
    }
}
