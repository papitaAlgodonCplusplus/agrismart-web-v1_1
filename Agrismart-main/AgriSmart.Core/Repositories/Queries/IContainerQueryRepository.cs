using AgriSmart.Core.Entities;

namespace AgriSmart.Core.Repositories.Queries
{
    public interface IContainerQueryRepository
    {
        Task<IReadOnlyList<Container>> GetAllAsync(int catalogId = 0, bool includeInactives = false);
        Task<Container?> GetByIdAsync(int id);
    }
}
