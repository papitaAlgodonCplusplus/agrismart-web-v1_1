using AgriSmart.Core.Entities;

namespace AgriSmart.Core.Repositories.Queries
{
    public interface ICropQueryRepository
    {
        Task<IReadOnlyList<Crop>> GetAllAsync(bool includeInactives = false);
        Task<Crop?> GetByIdAsync(int id);
    }
}
