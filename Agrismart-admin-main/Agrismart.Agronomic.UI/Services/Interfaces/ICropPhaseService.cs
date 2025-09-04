using Agrismart.Agronomic.UI.Services.Requests.Commands;
using Agrismart.Agronomic.UI.Services.Requests.Queries;
using Agrismart.Agronomic.UI.Services.Responses;

namespace Agrismart.Agronomic.UI.Services.Interfaces
{
    public interface ICropPhaseService
    {
        Task<GetAllCropPhasesResponse> GetAll(GetAllCropPhasesRequest request);
        Task<CropPhaseResponse> Create(CreateCropPhaseRequest request);
        Task<CropPhaseResponse> Update(UpdateCropPhaseRequest request);
    }
}