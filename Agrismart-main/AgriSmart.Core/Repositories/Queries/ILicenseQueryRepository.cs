using AgriSmart.Core.Entities;

namespace AgriSmart.Core.Repositories.Queries
{
    public interface ILicenseQueryRepository
    {        
        Task<IReadOnlyList<License>> GetAllAsync(int clientId, bool includeInactives = false);
        Task<License?> GetByIdAsync(int id);
    }
}
