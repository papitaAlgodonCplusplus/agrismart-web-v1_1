using AgriSmart.Core.Entities;
using AgriSmart.Core.Repositories.Queries;
using Microsoft.Extensions.Caching.Memory;
using Microsoft.Extensions.DependencyInjection;

namespace AgriSmart.Application.Iot.Services
{
    public class DeviceSensorCacheService
    {
        private readonly IDeviceSensorQueryRepository _deviceSensorQueryRepository;
        private readonly IMemoryCache _cache;
        private readonly IServiceScopeFactory _scopeFactory;
        private readonly TimeSpan _cacheDuration = TimeSpan.FromMinutes(10);

        public DeviceSensorCacheService(IMemoryCache cache, IServiceScopeFactory scopeFactory, IDeviceSensorQueryRepository deviceSensorQueryRepository)
        {
            _cache = cache;
            _scopeFactory = scopeFactory;
            _deviceSensorQueryRepository = deviceSensorQueryRepository;
        }

        // Get cached devices
        public List<Device> GetDevices()
        {
            return _deviceSensorQueryRepository.GetDevices();
        }

        // Get cached sensors
        public List<Sensor> GetSensors()
        {
            return _deviceSensorQueryRepository.GetSensors();
        }

        public void RefreshCache()
        {
            _deviceSensorQueryRepository.RefreshCache();
        }
    }
}
