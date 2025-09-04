using Agrismart.Agronomic.UI.Services.Requests.Commands;
using Agrismart.Agronomic.UI.Services.Requests.Queries;
using Agrismart.Agronomic.UI.Services.Responses;

namespace Agrismart.Agronomic.UI.Services.Interfaces
{
    public interface ICropPhaseOptimalService
    {
        Task<GetAllCropPhaseOptimalsResponse> GetAll(GetAllCropPhaseOptimalsRequest request);
        Task<CropPhaseOptimalResponse> Create(CreateCropPhaseOptimalRequest request);
        Task<CropPhaseOptimalResponse> Update(UpdateCropPhaseOptimalRequest request);
    }
}