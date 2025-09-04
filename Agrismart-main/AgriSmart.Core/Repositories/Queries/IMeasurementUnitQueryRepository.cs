using AgriSmart.Core.Entities;

namespace AgriSmart.Core.Repositories.Queries
{
    public interface IMeasurementUnitQueryRepository
    {
        Task<IReadOnlyList<MeasurementUnit>> GetAllAsync(bool includeInactives = false);
    }
}
