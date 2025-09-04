using AgriSmart.Core.Entities;

namespace AgriSmart.Core.Repositories.Queries
{
    public interface IWaterQueryRepository
    {
        Task<IReadOnlyList<Water>> GetAllAsync(int catalogId = 0, bool includeInactives = false);
        Task<Water> GetByIdAsync(int id);
    }
}