using AgriSmart.Core.Entities;

namespace AgriSmart.Core.Repositories.Queries
{
    public interface IFertilizerQueryRepository
    {
        Task<IReadOnlyList<Fertilizer>> GetAllAsync(int catalogId = 0, bool includeInactives = false);
        Task<Fertilizer> GetByIdAsync(int id);
    }
}
