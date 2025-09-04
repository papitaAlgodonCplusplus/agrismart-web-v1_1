using Agrismart.Agronomic.UI.Services.Requests.Queries;
using Agrismart.Agronomic.UI.Services.Responses;

namespace Agrismart.Agronomic.UI.Services.Interfaces
{
    public interface IUserStatusService
    {
        Task<GetAllUserStatusesResponse> GetAll(GetAllUserStatusesRequest request);
    }
}
 