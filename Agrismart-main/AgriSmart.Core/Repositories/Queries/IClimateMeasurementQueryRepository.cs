using AgriSmart.Core.Entities;

namespace AgriSmart.Core.Repositories.Queries
{
    public interface IClimateMeasurementQueryRepository
    {
        Task<IEnumerable<ClimateMeasurement>> GetAllByDeviceAsync(long deviceId);
    }
}