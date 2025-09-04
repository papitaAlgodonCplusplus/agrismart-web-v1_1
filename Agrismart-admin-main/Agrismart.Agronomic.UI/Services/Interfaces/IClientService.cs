using Agrismart.Agronomic.UI.Services.Requests.Commands;
using Agrismart.Agronomic.UI.Services.Requests.Queries;
using Agrismart.Agronomic.UI.Services.Responses;

namespace Agrismart.Agronomic.UI.Services.Interfaces
{
    public interface IClientService
    {
        Task<GetAllClientsResponse> GetAll(GetAllClientsRequest request);
        Task<ClientResponse> Create(CreateClientRequest request);
        Task<ClientResponse> Update(UpdateClientRequest request);
    }
}
