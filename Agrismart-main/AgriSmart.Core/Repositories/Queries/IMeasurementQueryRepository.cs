using AgriSmart.Core.Entities;

namespace AgriSmart.Core.Repositories.Queries
{
    public interface IMeasurementQueryRepository
    {
        Task<IReadOnlyList<Measurement>> GetAllAsync(DateTime periodStartingDate, DateTime perdiodEndidngDate, int cropProductionId = 0, int measurementVariableId = 0);
    }
}
