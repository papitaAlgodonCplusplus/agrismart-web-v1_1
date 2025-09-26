using AgriSmart.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;
using System.Data;
using AgriSmart.Core.Repositories.Queries;
using Microsoft.Extensions.Caching.Memory;
using AgriSmart.Core.Entities;
using Microsoft.Extensions.DependencyInjection;


namespace AgriSmart.Infrastructure.Repositories.Query
{
    public class DeviceSensorCacheRepository: IDeviceSensorQueryRepository
    {
        protected readonly AgriSmartContext _context;
        private readonly IMemoryCache _cache;
        private readonly IServiceScopeFactory _scopeFactory;
        private readonly TimeSpan _cacheDuration = TimeSpan.FromMinutes(5); // Refresh every 5 minutes

        private const string CacheKey = "DevicesAndSensors";
        public DeviceSensorCacheRepository(AgriSmartContext context, IMemoryCache cache, IServiceScopeFactory scopeFactory)
        {
            _context = context;
            _cache = cache;
            _scopeFactory = scopeFactory;
        }


        public List<Device> GetDevices()
        {
            if (!_cache.TryGetValue("Devices", out List<Device> devices))
            {
                devices = GetDevicesFromDatabase();
                _cache.Set("Devices", devices, _cacheDuration);
            }
            return devices;
        }

        public List<Sensor> GetSensors()
        {
            if (!_cache.TryGetValue("Sensors", out List<Sensor> sensors))
            {
                sensors = GetSensorsFromDatabase();
                _cache.Set("Sensors", sensors, _cacheDuration);
            }
            return sensors;
        }

        public List<Device> GetDevicesFromDatabase()
        {
            using (var scope = _scopeFactory.CreateScope())
            {
                var context = scope.ServiceProvider.GetRequiredService<AgriSmartContext>();
                return context.Device.Where(d => d.Active == true).ToList();
            }
        }
        public List<Sensor> GetSensorsFromDatabase()
        {
            using (var scope = _scopeFactory.CreateScope())
            {
                var context = scope.ServiceProvider.GetRequiredService<AgriSmartContext>();
                return context.Sensor.Where(s => s.Active == true).ToList();
            }
        }

        public void RefreshCache()
        {
            _cache.Remove("Devices");
            _cache.Remove("Sensors");

            var devices = GetDevicesFromDatabase();
            var sensors = GetSensorsFromDatabase();

            _cache.Set("Devices", devices, _cacheDuration);
            _cache.Set("Sensors", sensors, _cacheDuration);
        }

    }
}
