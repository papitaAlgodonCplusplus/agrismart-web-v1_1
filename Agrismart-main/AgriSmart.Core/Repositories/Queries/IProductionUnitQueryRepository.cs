using AgriSmart.Core.Entities;

namespace AgriSmart.Core.Repositories.Queries
{
    public interface IProductionUnitQueryRepository
    {
        Task<IReadOnlyList<ProductionUnit>> GetAllAsync(int companyId = 0, int farmId = 0, bool includeInactives = false);
        Task<ProductionUnit?> GetByIdAsync(long id);        
    }
}
