namespace AgriSmart.Core.Repositories.Commands
{
    public interface IBaseCommandRepository<T> where T : class
    {
        Task<T> CreateAsync(T entity);
        Task<T> UpdateAsync(T entity);
        Task DeleteAsync(T entity);
        int GetSessionUserId();
        int GetSessionProfileId();
        int GetSessionClientId();
    }
}
