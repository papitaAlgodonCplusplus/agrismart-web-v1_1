using AgriSmart.Core.Entities;

namespace AgriSmart.Core.Repositories.Queries
{
    public interface ICropPhaseOptimalQueryRepository
    {
        Task<IReadOnlyList<CropPhaseOptimal>> GetAllAsync(int catalogId = 0, bool includeInactives = false);
        Task<CropPhaseOptimal?> GetByIdAsync(int id);
    }
}