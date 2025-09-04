using AgriSmart.Core.Entities;

namespace AgriSmart.Core.Repositories.Queries
{
    public interface IGraphQueryRepository
    {
        Task<IReadOnlyList<Graph>> GetAllAsync(int catalogId = 0, bool includeInactives = false);
        Task<Graph?> GetByIdAsync(int id);
    }
}
