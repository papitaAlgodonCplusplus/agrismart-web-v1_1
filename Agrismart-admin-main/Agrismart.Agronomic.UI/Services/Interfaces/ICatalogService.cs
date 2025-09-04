using Agrismart.Agronomic.UI.Services.Requests.Commands;
using Agrismart.Agronomic.UI.Services.Requests.Queries;
using Agrismart.Agronomic.UI.Services.Responses;

namespace Agrismart.Agronomic.UI.Services.Interfaces
{
    public interface ICatalogService
    {
        Task<GetAllCatalogsResponse> GetAll(GetAllCatalogsRequest request);
        Task<CatalogResponse> Create(CreateCatalogRequest request);
        Task<CatalogResponse> Update(UpdateCatalogRequest request);
    }
}
