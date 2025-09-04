using AgriSmart.Core.Entities;

namespace AgriSmart.Core.Repositories.Queries
{
    public interface IAnalyticalEntityQueryRepository
    {
        Task<IReadOnlyList<AnalyticalEntity>> GetAllAsync(int catalogId = 0, bool includeInactives = false);
        Task<AnalyticalEntity?> GetByIdAsync(int id);
    }
}
