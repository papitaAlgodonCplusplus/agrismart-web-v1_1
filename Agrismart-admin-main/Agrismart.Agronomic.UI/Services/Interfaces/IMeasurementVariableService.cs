using Agrismart.Agronomic.UI.Services.Requests.Commands;
using Agrismart.Agronomic.UI.Services.Requests.Queries;
using Agrismart.Agronomic.UI.Services.Responses;

namespace Agrismart.Agronomic.UI.Services.Interfaces
{
    public interface IMeasurementVariableService
    {
        Task<GetAllMeasurementVariablesResponse> GetAll(GetAllMeasurementVariablesRequest request);
        Task<MeasurementVariableResponse> Create(CreateMeasurementVariableRequest request);
        Task<MeasurementVariableResponse> Update(UpdateMeasurementVariableRequest request);
    }
}