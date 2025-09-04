using Agrismart.Agronomic.UI.Services.Requests.Commands;
using Agrismart.Agronomic.UI.Services.Requests.Queries;
using Agrismart.Agronomic.UI.Services.Responses;

namespace Agrismart.Agronomic.UI.Services.Interfaces
{
    public interface IFertilizerInputService
    {
        Task<GetAllFertilizerInputsResponse> GetAll(GetAllFertilizerInputsRequest request);
        Task<FertilizerInputResponse> Create(CreateFertilizerInputRequest request);
        Task<FertilizerInputResponse> Update(UpdateFertilizerInputRequest request);
    }
}