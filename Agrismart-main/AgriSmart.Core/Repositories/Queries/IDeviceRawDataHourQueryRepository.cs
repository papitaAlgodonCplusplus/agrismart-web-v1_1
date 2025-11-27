using AgriSmart.Core.Entities;

namespace AgriSmart.Core.Repositories.Queries
{
    public interface IDeviceRawDataHourQueryRepository
    {
        Task<IReadOnlyList<DeviceRawDataHour>> GetAllAsync(
            string? deviceId = null,
            DateTime? startDate = null,
            DateTime? endDate = null,
            string? sensor = null,
            int pageNumber = 1,
            int pageSize = 100);

        Task<int> GetCountAsync(
            string? deviceId = null,
            DateTime? startDate = null,
            DateTime? endDate = null,
            string? sensor = null);
    }
}
