using AgriSmart.Core.Entities;

namespace AgriSmart.Core.Repositories.Queries
{
    public interface IProfileQueryRepository
    {
        Task<IReadOnlyList<Profile>> GetAllAsync(bool includeInactives = false);
    }
}