using Agrismart.Agronomic.UI.Services.Requests.Commands;
using Agrismart.Agronomic.UI.Services.Requests.Queries;
using Agrismart.Agronomic.UI.Services.Responses;

namespace Agrismart.Agronomic.UI.Services.Interfaces
{
    public interface ICalculationSettingService
    {
        Task<GetAllCalculationSettingsResponse> GetAll(GetAllCalculationSettingsRequest request);
        Task<CalculationSettingResponse> Create(CreateCalculationSettingRequest request);
        Task<CalculationSettingResponse> Update(UpdateCalculationSettingRequest request);
    }
}