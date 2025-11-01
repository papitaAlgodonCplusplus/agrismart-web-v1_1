using AgriSmart.Core.Entities;
using AgriSmart.Core.Repositories.Queries;

namespace AgriSmart.Infrastructure.Repositories.Query
{
    /// <summary>
    /// Extension methods for UserQueryRepository
    /// Add this to your existing UserQueryRepository.cs or create a new file
    /// </summary>
    public static class UserQueryRepositoryExtensions
    {
        /// <summary>
        /// Get user by email address
        /// </summary>
        public static async Task<User?> GetByEmailAsync(this IUserQueryRepository repository, string email)
        {
            var allUsers = await repository.GetAllAsync(0, 0, 0);
            return allUsers.FirstOrDefault(u => u.UserEmail == email);
        }
    }
}