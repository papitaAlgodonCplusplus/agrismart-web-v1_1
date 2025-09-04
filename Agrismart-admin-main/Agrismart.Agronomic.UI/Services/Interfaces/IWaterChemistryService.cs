using Agrismart.Agronomic.UI.Services.Requests.Commands;
using Agrismart.Agronomic.UI.Services.Requests.Queries;
using Agrismart.Agronomic.UI.Services.Responses;

namespace Agrismart.Agronomic.UI.Services.Interfaces
{
    public interface IWaterChemistryService
    {
        Task<GetAllWaterChemistriesResponse> GetAll(GetAllWaterChemistriesRequest request);
        Task<WaterChemistryResponse> Create(CreateWaterChemistryRequest request);
        Task<WaterChemistryResponse> Update(UpdateWaterChemistryRequest request);
    }
}