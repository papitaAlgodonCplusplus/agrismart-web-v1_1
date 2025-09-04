using AgriSmart.Core.Entities;

namespace AgriSmart.Core.Repositories.Queries
{
    public interface IMeasurementKPIQueryRepository
    {
        Task<IReadOnlyList<MeasurementKPI>> GetAllAsync(DateTime periodStartingDate, DateTime perdiodEndidngDate, int cropProductionId = 0, int kpiId = 0);
        Task<MeasurementKPI> GetLatestAsync(DateTime periodStartingDate, DateTime periodEndingDate, int cropProductionId = 0, int kpiId = 0);
    }
}
