using AgriSmart.Core.Entities;

namespace AgriSmart.Core.Repositories.Queries
{
    public interface ICropPhaseQueryRepository
    {
        Task<IReadOnlyList<CropPhase>> GetAllAsync(int cropId = 0, int catalogId = 0, bool includeInactives = false);
        Task<CropPhase?> GetByIdAsync(int id);
    }
}
