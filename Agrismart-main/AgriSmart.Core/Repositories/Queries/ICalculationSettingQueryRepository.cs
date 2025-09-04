using AgriSmart.Core.Entities;

namespace AgriSmart.Core.Repositories.Queries
{
    public interface ICalculationSettingQueryRepository
    {
        Task<IReadOnlyList<CalculationSetting>> GetAllAsync(int catalogId = 0, bool includeInactives = false);
        Task<CalculationSetting?> GetByIdAsync(int id);
    }
}