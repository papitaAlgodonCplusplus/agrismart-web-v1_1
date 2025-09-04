using Agrismart.Agronomic.UI.Services.Requests.Commands;
using Agrismart.Agronomic.UI.Services.Requests.Queries;
using Agrismart.Agronomic.UI.Services.Responses;

namespace Agrismart.Agronomic.UI.Services.Interfaces
{
    public interface ICropProductionIrrigationSectorService
    {
        Task<GetAllCropProductionIrrigationSectorsResponse> GetAll(GetAllCropProductionIrrigationSectorsRequest request);
        Task<CropProductionIrrigationSectorResponse> Create(CreateCropProductionIrrigationSectorRequest request);
        Task<CropProductionIrrigationSectorResponse> Update(UpdateCropProductionIrrigationSectorRequest request);
    }
}
