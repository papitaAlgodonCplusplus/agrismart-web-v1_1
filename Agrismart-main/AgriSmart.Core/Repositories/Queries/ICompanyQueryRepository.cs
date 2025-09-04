using AgriSmart.Core.Entities;

namespace AgriSmart.Core.Repositories.Queries
{
    public interface ICompanyQueryRepository 
    {
        Task<IReadOnlyList<Company>> GetAllAsync(int clientId, bool includeInactives = false);
        Task<Company?> GetByIdAsync(int id, bool isIot = false);
    }
}
