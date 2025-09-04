using AgriSmart.Core.Entities;

namespace AgriSmart.Core.Repositories.Queries
{
    public interface IRelayModuleQueryRepository
    {        
        Task<IReadOnlyList<RelayModule>> GetAllAsync(bool includeInactives = false);
        Task<RelayModule?> GetByIdAsync(int id);
    }
}
