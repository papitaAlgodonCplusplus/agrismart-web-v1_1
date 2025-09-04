using AgriSmart.Core.Entities;

namespace AgriSmart.Core.Repositories.Queries
{
    public interface IDropperQueryRepository
    {
        Task<IReadOnlyList<Dropper>> GetAllAsync(int catalogId = 0, bool includeInactives = false);
        Task<Dropper?> GetByIdAsync(int id);
    }
}