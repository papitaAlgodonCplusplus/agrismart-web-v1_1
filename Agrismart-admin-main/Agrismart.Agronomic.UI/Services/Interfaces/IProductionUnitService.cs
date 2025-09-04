using Agrismart.Agronomic.UI.Services.Requests.Commands;
using Agrismart.Agronomic.UI.Services.Requests.Queries;
using Agrismart.Agronomic.UI.Services.Responses;

namespace Agrismart.Agronomic.UI.Services.Interfaces
{
    public interface IProductionUnitService
    {
        Task<GetAllProductionUnitsResponse> GetAll(GetAllProductionUnitsRequest request);
        Task<ProductionUnitResponse> Create(CreateProductionUnitRequest request);
        Task<ProductionUnitResponse> Update(UpdateProductionUnitRequest request);
    }
}
