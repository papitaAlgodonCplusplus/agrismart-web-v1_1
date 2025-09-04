using Agrismart.Agronomic.UI.Services.Requests.Commands;
using Agrismart.Agronomic.UI.Services.Requests.Queries;
using Agrismart.Agronomic.UI.Services.Responses;

namespace Agrismart.Agronomic.UI.Services.Interfaces
{
    public interface IContainerService
    {
        Task<GetAllContainersResponse> GetAll(GetAllContainersRequest request);
        Task<ContainerResponse> Create(CreateContainerRequest request);
        Task<ContainerResponse> Update(UpdateContainerRequest request);
    }
}
