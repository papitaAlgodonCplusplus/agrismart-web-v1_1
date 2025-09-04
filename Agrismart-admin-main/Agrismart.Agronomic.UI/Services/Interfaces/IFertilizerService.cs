using Agrismart.Agronomic.UI.Services.Requests.Commands;
using Agrismart.Agronomic.UI.Services.Requests.Queries;
using Agrismart.Agronomic.UI.Services.Responses;

namespace Agrismart.Agronomic.UI.Services.Interfaces
{
    public interface IFertilizerService
    {
        Task<GetAllFertilizersResponse> GetAll(GetAllFertilizersRequest request);
        Task<FertilizerResponse> Create(CreateFertilizerRequest request);
        Task<FertilizerResponse> Update(UpdateFertilizerRequest request);
    }
}