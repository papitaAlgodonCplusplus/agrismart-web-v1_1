using AgriSmart.Core.Entities;

namespace AgriSmart.Core.Repositories.Queries
{
    public interface IMeasurementBaseQueryRepository
    {
        Task<IReadOnlyList<MeasurementBase>> GetAllAsync(DateTime periodStartingDate, DateTime perdiodEndidngDate, int cropProductionId = 0, int measurementVariableId = 0);
    }
}
