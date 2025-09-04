using Agrismart.Agronomic.UI.Services.Requests.Commands;
using Agrismart.Agronomic.UI.Services.Requests.Queries;
using Agrismart.Agronomic.UI.Services.Responses;

namespace Agrismart.Agronomic.UI.Services.Interfaces
{
    public interface IFertilizerChemistryService
    {
        Task<GetAllFertilizerChemistriesResponse> GetAll(GetAllFertilizerChemistriesRequest request);
        Task<FertilizerChemistryResponse> Create(CreateFertilizerChemistryRequest request);
        Task<FertilizerChemistryResponse> Update(UpdateFertilizerChemistryRequest request);
    }
}