using AgriSmart.Core.Entities;

namespace AgriSmart.Core.Repositories.Queries
{
    public interface IClientQueryRepository
    {        
        Task<IReadOnlyList<Client>> GetAllAsync(bool includeInactives = false);
        Task<Client?> GetByIdAsync(int id);
    }
}
