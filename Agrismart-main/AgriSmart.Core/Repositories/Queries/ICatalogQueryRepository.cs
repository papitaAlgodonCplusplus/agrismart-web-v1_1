using AgriSmart.Core.Entities;

namespace AgriSmart.Core.Repositories.Queries
{
    public interface ICatalogQueryRepository
    {
        Task<IReadOnlyList<Catalog>> GetAllAsync(int clientId, bool includeInactives = false);
        Task<Catalog?> GetByIdAsync(int id);
    }
}
