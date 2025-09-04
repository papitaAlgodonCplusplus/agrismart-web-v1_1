using Agrismart.Agronomic.UI.Services.Requests.Commands;
using Agrismart.Agronomic.UI.Services.Requests.Queries;
using Agrismart.Agronomic.UI.Services.Responses;

namespace Agrismart.Agronomic.UI.Services.Interfaces
{
    public interface IRelayModuleService
    {
        Task<GetAllRelayModulesResponse> GetAll(GetAllRelayModulesRequest request);
        Task<RelayModuleResponse> Create(CreateRelayModuleRequest request);
        Task<RelayModuleResponse> Update(UpdateRelayModuleRequest request);
    }
}
