using AgriSmart.Application.Iot.Services;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using System;
using System.Threading;
using System.Threading.Tasks;

namespace AgriSmart.Application.Iot.Handlers
{
    public class DeviceSensorCacheRefreshHandler: IHostedService, IDisposable
    {
        private readonly IServiceScopeFactory _scopeFactory;
        private Timer _timer;

        public DeviceSensorCacheRefreshHandler(IServiceScopeFactory scopeFactory)
        {
            _scopeFactory = scopeFactory;
        }

        public Task StartAsync(CancellationToken cancellationToken)
        {
            _timer = new Timer(RefreshCache, null, TimeSpan.Zero, TimeSpan.FromMinutes(10));
            return Task.CompletedTask;
        }

        private void RefreshCache(object state)
        {
            using (var scope = _scopeFactory.CreateScope())
            {
                var cacheService = scope.ServiceProvider.GetRequiredService<DeviceSensorCacheService>();
                cacheService.RefreshCache();
            }
        }

        public Task StopAsync(CancellationToken cancellationToken)
        {
            _timer?.Change(Timeout.Infinite, 0);
            return Task.CompletedTask;
        }

        public void Dispose()
        {
            _timer?.Dispose();
        }
    }
}
