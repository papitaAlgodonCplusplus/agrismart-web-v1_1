using AgriSmart.Core.Entities;

namespace AgriSmart.Core.Repositories.Queries
{
    public interface IMeasurementVariableStandardQueryRepository
    {
        Task<IReadOnlyList<MeasurementVariableStandard>> GetAllAsync(bool includeInactives = false);
    }
}
