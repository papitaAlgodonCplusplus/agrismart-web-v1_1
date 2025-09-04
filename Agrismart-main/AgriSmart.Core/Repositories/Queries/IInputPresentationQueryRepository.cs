using AgriSmart.Core.Entities;

namespace AgriSmart.Core.Repositories.Queries
{
    public interface IInputPresentationQueryRepository
    {
        Task<IReadOnlyList<InputPresentation>> GetAllAsync(int CatalogId, bool includeInactives);
        Task<InputPresentation?> GetByIdAsync(int id);
    }
}
