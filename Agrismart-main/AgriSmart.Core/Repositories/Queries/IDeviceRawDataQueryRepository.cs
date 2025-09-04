using AgriSmart.Core.Entities;

namespace AgriSmart.Core.Repositories.Queries
{
    public interface IDeviceRawDataQueryRepository
    {
        Task<IReadOnlyList<DeviceRawData>> GetAllAsync(string deviceId);
    }
}
