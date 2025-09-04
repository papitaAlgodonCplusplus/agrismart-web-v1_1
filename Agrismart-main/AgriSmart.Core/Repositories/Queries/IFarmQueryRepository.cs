using AgriSmart.Core.Entities;

namespace AgriSmart.Core.Repositories.Queries
{
    public interface IFarmQueryRepository
    {
        Task<IReadOnlyList<Farm>> GetAllAsync(int clientId = 0, int companyId = 0, int userId = 0, bool includeInactives = false);
        Task<Farm?> GetByIdAsync(int id);
    }
}
