using Agrismart.Agronomic.UI.Services.Requests.Commands;
using Agrismart.Agronomic.UI.Services.Requests.Queries;
using Agrismart.Agronomic.UI.Services.Responses;

namespace Agrismart.Agronomic.UI.Services.Interfaces
{
    public interface IGrowingMediumService
    {
        Task<GetAllGrowingMediumsResponse> GetAll(GetAllGrowingMediumsRequest request);
        Task<GrowingMediumResponse> Create(CreateGrowingMediumRequest request);
        Task<GrowingMediumResponse> Update(UpdateGrowingMediumRequest request);
    }
}