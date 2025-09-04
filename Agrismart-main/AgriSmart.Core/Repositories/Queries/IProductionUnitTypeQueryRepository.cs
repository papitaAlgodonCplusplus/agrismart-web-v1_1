using AgriSmart.Core.Entities;

namespace AgriSmart.Core.Repositories.Queries
{
    public interface IProductionUnitTypeQueryRepository
    {
        Task<IReadOnlyList<ProductionUnitType>> GetAllAsync(bool includeInactives = false);
    }
}
