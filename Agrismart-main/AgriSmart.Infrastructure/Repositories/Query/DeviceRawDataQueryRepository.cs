using AgriSmart.Core.Configuration;
using AgriSmart.Infrastructure.Data;
using AgriSmart.Core.Entities;
using AgriSmart.Core.DTOs;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Options;
using AgriSmart.Core.Repositories.Queries;
using Microsoft.AspNetCore.Http;

namespace AgriSmart.Infrastructure.Repositories.Query
{
    public class DeviceRawDataQueryRepository : BaseQueryRepository<DeviceRawData>, IDeviceRawDataQueryRepository
    {
        protected readonly AgriSmartContext _context;
        
        public DeviceRawDataQueryRepository(AgriSmartContext context, IOptions<AgriSmartDbConfiguration> dbConfiguration, IHttpContextAccessor httpContextAccessor) 
            : base(dbConfiguration, httpContextAccessor)
        {
            _context = context;
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
                var query = _context.DeviceRawData.AsQueryable();

                if (!string.IsNullOrEmpty(deviceId))
                    query = query.Where(x => x.DeviceId == deviceId);

                if (startDate.HasValue)
                    query = query.Where(x => x.RecordDate >= startDate.Value);

                if (endDate.HasValue)
                    query = query.Where(x => x.RecordDate <= endDate.Value);

                if (!string.IsNullOrEmpty(sensor))
                    query = query.Where(x => x.Sensor == sensor);

                return await query
                    .OrderByDescending(x => x.RecordDate)
                    .Skip((pageNumber - 1) * pageSize)
                    .Take(pageSize)
                    .AsNoTracking()
                    .ToListAsync();
            }
            catch (Exception ex)
            {
                throw new Exception(ex.Message, ex);
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
                var query = _context.DeviceRawData.AsQueryable();

                if (!string.IsNullOrEmpty(deviceId))
                    query = query.Where(x => x.DeviceId == deviceId);

                if (startDate.HasValue)
                    query = query.Where(x => x.RecordDate >= startDate.Value);

                if (endDate.HasValue)
                    query = query.Where(x => x.RecordDate <= endDate.Value);

                if (!string.IsNullOrEmpty(sensor))
                    query = query.Where(x => x.Sensor == sensor);

                return await query.CountAsync();
            }
            catch (Exception ex)
            {
                throw new Exception(ex.Message, ex);
            }
        }

        public async Task<DeviceRawData?> GetByIdAsync(int id)
        {
            try
            {
                return await _context.DeviceRawData
                    .Where(x => x.Id == id)
                    .AsNoTracking()
                    .FirstOrDefaultAsync();
            }
            catch (Exception ex)
            {
                throw new Exception(ex.Message, ex);
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
            var query = _context.DeviceRawData.AsQueryable();

            // Apply filters
            if (!string.IsNullOrEmpty(deviceId))
                query = query.Where(x => x.DeviceId == deviceId);

            if (startDate.HasValue)
                query = query.Where(x => x.RecordDate >= startDate.Value);

            if (endDate.HasValue)
                query = query.Where(x => x.RecordDate <= endDate.Value);

            if (!string.IsNullOrEmpty(sensor))
                query = query.Where(x => x.Sensor == sensor);

            query = query.Where(x => !string.IsNullOrEmpty(x.Payload) && x.RecordDate.HasValue);

            // Process based on aggregation interval
            var result = new List<AggregatedDeviceData>();
            var data = await query.AsNoTracking().ToListAsync();

            // Group data (simple in-memory grouping to avoid EF translation issues)
            var grouped = data.GroupBy(x => new
            {
                x.DeviceId,
                x.Sensor,
                Timestamp = GetGroupTimestamp(x.RecordDate!.Value, aggregationInterval)
            });

            foreach (var group in grouped.OrderByDescending(g => g.Key.Timestamp).Skip((pageNumber - 1) * pageSize).Take(pageSize))
            {
                var values = group.Select(x => decimal.TryParse(x.Payload, out var val) ? val : 0).Where(v => v != 0).ToList();
                if (values.Any())
                {
                    result.Add(new AggregatedDeviceData
                    {
                        Timestamp = group.Key.Timestamp,
                        DeviceId = group.Key.DeviceId ?? "",
                        Sensor = group.Key.Sensor ?? "",
                        Value = aggregationType.ToLower() switch
                        {
                            "avg" => (decimal)values.Average(),
                            "min" => values.Min(),
                            "max" => values.Max(),
                            "sum" => values.Sum(),
                            _ => (decimal)values.Average()
                        },
                        MinValue = values.Min(),
                        MaxValue = values.Max(),
                        DataPointCount = values.Count
                    });
                }
            }

            return result.AsReadOnly();
        }

        public async Task<int> GetAggregatedCountAsync(
            string? deviceId = null,
            DateTime? startDate = null,
            DateTime? endDate = null,
            string? sensor = null,
            string aggregationInterval = "hour")
        {
            var query = _context.DeviceRawData.AsQueryable();

            if (!string.IsNullOrEmpty(deviceId))
                query = query.Where(x => x.DeviceId == deviceId);

            if (startDate.HasValue)
                query = query.Where(x => x.RecordDate >= startDate.Value);

            if (endDate.HasValue)
                query = query.Where(x => x.RecordDate <= endDate.Value);

            if (!string.IsNullOrEmpty(sensor))
                query = query.Where(x => x.Sensor == sensor);

            query = query.Where(x => !string.IsNullOrEmpty(x.Payload) && x.RecordDate.HasValue);

            var data = await query.AsNoTracking().ToListAsync();

            var grouped = data.GroupBy(x => new
            {
                x.DeviceId,
                x.Sensor,
                Timestamp = GetGroupTimestamp(x.RecordDate!.Value, aggregationInterval)
            });

            return grouped.Count();
        }

        private DateTime GetGroupTimestamp(DateTime date, string interval)
        {
            return interval.ToLower() switch
            {
                "minute" => new DateTime(date.Year, date.Month, date.Day, date.Hour, date.Minute, 0),
                "hour" => new DateTime(date.Year, date.Month, date.Day, date.Hour, 0, 0),
                "day" => new DateTime(date.Year, date.Month, date.Day),
                "week" => date.Date.AddDays(-(int)date.DayOfWeek),
                "month" => new DateTime(date.Year, date.Month, 1),
                _ => new DateTime(date.Year, date.Month, date.Day, date.Hour, 0, 0)
            };
        }
    }
}