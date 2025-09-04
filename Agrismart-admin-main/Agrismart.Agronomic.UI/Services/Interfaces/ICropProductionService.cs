using Agrismart.Agronomic.UI.Services.Requests.Commands;
using Agrismart.Agronomic.UI.Services.Requests.Queries;
using Agrismart.Agronomic.UI.Services.Responses;

namespace Agrismart.Agronomic.UI.Services.Interfaces
{
    public interface ICropProductionService
    {
        Task<GetAllCropProductionsResponse> GetAll(GetAllCropProductionsRequest request);
        Task<CropProductionResponse> Create(CreateCropProductionRequest request);
        Task<CropProductionResponse> Update(UpdateCropProductionRequest request);
    }
}
