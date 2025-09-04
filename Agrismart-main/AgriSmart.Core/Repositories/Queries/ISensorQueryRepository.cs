using AgriSmart.Core.Entities;

namespace AgriSmart.Core.Repositories.Queries
{
    public interface ISensorQueryRepository
    {
        Task<IReadOnlyList<Sensor>> GetAllAsync(int companyId, int deviceId, bool includeInactives = false);
        Task<IReadOnlyList<Sensor>> GetAllAsync(bool includeInactives = false);
        Task<Sensor?> GetByIdAsync(int id);
    }
}