using AgriSmart.Core.Entities;

namespace AgriSmart.Core.Repositories.Queries
{
    public interface IGrowingMediumQueryRepository
    {
        Task<IReadOnlyList<GrowingMedium>> GetAllAsync(int catalogId = 0, bool includeInactives = false);
        Task<GrowingMedium?> GetByIdAsync(int id);
    }
}
