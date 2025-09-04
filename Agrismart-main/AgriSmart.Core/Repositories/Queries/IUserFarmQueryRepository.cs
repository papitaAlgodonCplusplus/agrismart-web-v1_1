using AgriSmart.Core.Entities;

namespace AgriSmart.Core.Repositories.Queries
{
    public interface IUserFarmQueryRepository
    {
        Task<IReadOnlyList<UserFarm>> GetAllAsync(int userId);
    }
}