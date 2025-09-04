using Agrismart.Agronomic.UI.Services.Requests.Commands;
using Agrismart.Agronomic.UI.Services.Requests.Queries;
using Agrismart.Agronomic.UI.Services.Responses;

namespace Agrismart.Agronomic.UI.Services.Interfaces
{
    public interface IDropperService
    {
        Task<GetAllDroppersResponse> GetAll(GetAllDroppersRequest request);
        Task<DropperResponse> Create(CreateDropperRequest request);
        Task<DropperResponse> Update(UpdateDropperRequest request);
    }
}
