using AgriSmart.Core.Entities;
using AgriSmart.Core.Repositories.Commands;

namespace AgriSmart.Core.Repositories.Queries
{
    public interface IDeviceSensorQueryRepository
    {
        List<Device> GetDevices();
        List<Sensor> GetSensors();
        void RefreshCache();
    }
}
