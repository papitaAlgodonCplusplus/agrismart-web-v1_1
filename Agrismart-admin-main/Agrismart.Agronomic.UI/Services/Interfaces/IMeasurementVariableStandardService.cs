using Agrismart.Agronomic.UI.Services.Requests.Commands;
using Agrismart.Agronomic.UI.Services.Requests.Queries;
using Agrismart.Agronomic.UI.Services.Responses;

namespace Agrismart.Agronomic.UI.Services.Interfaces
{
    public interface IMeasurementVariableStandardService
    {
        Task<GetAllMeasurementVariableStandardsResponse> GetAll(GetAllMeasurementVariableStandardsRequest request);
    }
}