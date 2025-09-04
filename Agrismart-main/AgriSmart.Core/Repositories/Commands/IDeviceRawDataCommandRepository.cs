using AgriSmart.Core.Entities;

namespace AgriSmart.Core.Repositories.Commands
{
    public interface IDeviceRawDataCommandRepository : IBaseCommandRepository<DeviceRawData>
    {
        Task<int> ProcessDeviceRawDataMeasurements(int deviceId);
    }
}
