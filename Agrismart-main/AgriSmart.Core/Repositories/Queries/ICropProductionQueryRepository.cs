using AgriSmart.Core.Entities;

namespace AgriSmart.Core.Repositories.Queries
{
    public interface ICropProductionQueryRepository
    {
        Task<IReadOnlyList<CropProduction>> GetAllAsync(int clientId = 0, int companyId = 0, int farmId = 0, int productionUnitId = 0, bool includeInactives = false);
        Task<CropProduction?> GetByIdAsync(long id);
    }
}
