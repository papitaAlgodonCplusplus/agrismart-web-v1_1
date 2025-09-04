using AgriSmart.Core.Entities;

namespace AgriSmart.Core.Repositories.Queries
{
    public interface IFertilizerInputQueryRepository
    {
        Task<IReadOnlyList<FertilizerInput>> GetAllAsync(int catalogId = 0, int fertilizerId = 0, bool includeInactives = false);
        Task<FertilizerInput?> GetByIdAsync(int id);
    }
}
