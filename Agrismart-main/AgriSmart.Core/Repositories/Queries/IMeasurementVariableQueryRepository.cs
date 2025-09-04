using AgriSmart.Core.Entities;

namespace AgriSmart.Core.Repositories.Queries
{
    public interface IMeasurementVariableQueryRepository
    {
        Task<IReadOnlyList<MeasurementVariable>> GetAllAsync(int catalogId);
        Task<MeasurementVariable> GetByIdAsync(int id);
    }
}
