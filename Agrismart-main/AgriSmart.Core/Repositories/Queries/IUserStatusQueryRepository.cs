using AgriSmart.Core.Entities;

namespace AgriSmart.Core.Repositories.Queries
{
    public interface IUserStatusQueryRepository
    {
        Task<IReadOnlyList<UserStatus>> GetAllAsync(bool includeInactives = false);        
    }
}