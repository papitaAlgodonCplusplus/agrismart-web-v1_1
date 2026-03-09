using AgriSmart.Core.Entities;

namespace AgriSmart.Core.Repositories.Queries
{
    public interface IContainerTypeQueryRepository
    {
        Task<IReadOnlyList<ContainerType>> GetAllAsync(bool includeInactives = false);
        Task<ContainerType?> GetByIdAsync(int id);
    }
}
