using AgriSmart.Core.Configuration;
using AgriSmart.Infrastructure.Data;
using AgriSmart.Core.Entities;
using AgriSmart.Core.DTOs;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Options;
using AgriSmart.Core.Repositories.Queries;
using Microsoft.AspNetCore.Http;
using AgriSmart.Infrastructure.Services;

namespace AgriSmart.Infrastructure.Repositories.Query
{
    public class DeviceRawDataQueryRepository : BaseQueryRepository<DeviceRawData>, IDeviceRawDataQueryRepository
    {
        protected readonly AgriSmartContext _context;
        private readonly InfluxDBService _influxDBService;

        public DeviceRawDataQueryRepository(
            AgriSmartContext context,
            IOptions<AgriSmartDbConfiguration> dbConfiguration,
            IHttpContextAccessor httpContextAccessor,
            InfluxDBService influxDBService)
            : base(dbConfiguration, httpContextAccessor)
        {
            _context = context;
            _influxDBService = influxDBService;
        }

        public async Task<IReadOnlyList<DeviceRawData>> GetAllAsync(string deviceId)
        {
            return await GetAllAsync(deviceId, null, null, null, 1, 100);
        }

        public async Task<IReadOnlyList<DeviceRawData>> GetAllAsync(
            string? deviceId = null,
            DateTime? startDate = null,
            DateTime? endDate = null,
            string? sensor = null,
            int pageNumber = 1,
            int pageSize = 100)
        {
            try
            {
                // Default date range if not specified (last 24 hours instead of 7 days)
                var start = startDate ?? DateTime.UtcNow.AddDays(-1);
                var end = endDate ?? DateTime.UtcNow;

                // Use InfluxDB instead of SQL
                var data = await _influxDBService.GetDeviceRawDataAsync(
                    start,
                    end,
                    deviceId,
                    sensor,
                    pageNumber,
                    pageSize,
                    CancellationToken.None);

                return data.AsReadOnly();
            }
            catch (Exception ex)
            {
                throw new Exception($"Error fetching data from InfluxDB: {ex.Message}", ex);
            }
        }

        public async Task<int> GetCountAsync(
            string? deviceId = null,
            DateTime? startDate = null,
            DateTime? endDate = null,
            string? sensor = null)
        {
            try
            {
                // Default date range if not specified (last 24 hours instead of 7 days)
                var start = startDate ?? DateTime.UtcNow.AddDays(-1);
                var end = endDate ?? DateTime.UtcNow;

                // Use InfluxDB count method
                return await _influxDBService.GetCountAsync(start, end, deviceId, sensor, CancellationToken.None);
            }
            catch (Exception ex)
            {
                throw new Exception($"Error fetching count from InfluxDB: {ex.Message}", ex);
            }
        }

        public async Task<DeviceRawData?> GetByIdAsync(int id)
        {
            try
            {
                // Note: InfluxDB doesn't support direct ID lookup efficiently
                // This method queries recent data and filters by ID
                var data = await _influxDBService.GetDeviceRawDataAsync(
                    DateTime.UtcNow.AddDays(-30),
                    DateTime.UtcNow);

                return data.FirstOrDefault(x => x.Id == id);
            }
            catch (Exception ex)
            {
                throw new Exception($"Error fetching data by ID from InfluxDB: {ex.Message}", ex);
            }
        }

        public async Task<IReadOnlyList<AggregatedDeviceData>> GetAggregatedDataAsync(
            string? deviceId = null,
            DateTime? startDate = null,
            DateTime? endDate = null,
            string? sensor = null,
            string aggregationInterval = "hour",
            string aggregationType = "avg",
            int pageNumber = 1,
            int pageSize = 1000)
        {
            try
            {
                // Default date range if not specified (last 24 hours instead of 7 days)
                var start = startDate ?? DateTime.UtcNow.AddDays(-1);
                var end = endDate ?? DateTime.UtcNow;

                // Use InfluxDB aggregated query - InfluxDB handles aggregation efficiently
                var data = await _influxDBService.GetAggregatedDeviceRawDataAsync(
                    start,
                    end,
                    deviceId,
                    sensor,
                    aggregationInterval,
                    aggregationType,
                    CancellationToken.None);

                // Apply pagination in memory (InfluxDB already sorted by time)
                return data
                    .Skip((pageNumber - 1) * pageSize)
                    .Take(pageSize)
                    .ToList()
                    .AsReadOnly();
            }
            catch (Exception ex)
            {
                throw new Exception($"Error fetching aggregated data from InfluxDB: {ex.Message}", ex);
            }
        }

        public async Task<int> GetAggregatedCountAsync(
            string? deviceId = null,
            DateTime? startDate = null,
            DateTime? endDate = null,
            string? sensor = null,
            string aggregationInterval = "hour")
        {
            try
            {
                // Default date range if not specified (last 24 hours instead of 7 days)
                var start = startDate ?? DateTime.UtcNow.AddDays(-1);
                var end = endDate ?? DateTime.UtcNow;

                // Get aggregated data and count results
                var data = await _influxDBService.GetAggregatedDeviceRawDataAsync(
                    start,
                    end,
                    deviceId,
                    sensor,
                    aggregationInterval,
                    "count",
                    CancellationToken.None);

                return data.Count;
            }
            catch (Exception ex)
            {
                throw new Exception($"Error fetching aggregated count from InfluxDB: {ex.Message}", ex);
            }
        }
    }
}