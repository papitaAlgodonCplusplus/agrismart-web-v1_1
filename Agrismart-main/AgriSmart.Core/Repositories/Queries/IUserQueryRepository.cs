using AgriSmart.Core.Entities;

namespace AgriSmart.Core.Repositories.Queries
{
    public interface IUserQueryRepository
    {
        Task<User?> AuthenticateAsync(string? userEmail, string? userPassword);
        Task<IReadOnlyList<User>> GetAllAsync(int profileId, int clientId, int userStatusId);
        Task<User?> GetByIdAsync(int id);
        Task<User?> GetBySessionIdAsync();
    }
}
