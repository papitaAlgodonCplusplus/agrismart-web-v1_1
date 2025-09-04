using Agrismart.Agronomic.UI.Services.Requests.Queries;
using Agrismart.Agronomic.UI.Services.Responses;

namespace Agrismart.Agronomic.UI.Services.Interfaces
{
    public interface IProfileService
    {
        Task<GetAllProfilesResponse> GetAll(GetAllProfilesRequest request);
    }
}
 