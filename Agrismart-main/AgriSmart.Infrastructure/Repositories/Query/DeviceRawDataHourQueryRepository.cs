using AgriSmart.Core.Configuration;
using AgriSmart.Infrastructure.Data;
using AgriSmart.Core.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Options;
using AgriSmart.Core.Repositories.Queries;
using Microsoft.AspNetCore.Http;

namespace AgriSmart.Infrastructure.Repositories.Query
{
    public class DeviceRawDataHourQueryRepository : BaseQueryRepository<DeviceRawDataHour>, IDeviceRawDataHourQueryRepository
    {
        protected readonly AgriSmartContext _context;

        public DeviceRawDataHourQueryRepository(AgriSmartContext context, IOptions<AgriSmartDbConfiguration> dbConfiguration, IHttpContextAccessor httpContextAccessor)
            : base(dbConfiguration, httpContextAccessor)
        {
            _context = context;
        }

        public async Task<IReadOnlyList<DeviceRawDataHour>> GetAllAsync(
            string? deviceId = null,
            DateTime? startDate = null,
            DateTime? endDate = null,
            string? sensor = null,
            int pageNumber = 1,
            int pageSize = 100)
        {
            try
            {
                var query = _context.DeviceRawDataHour.AsQueryable();

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
                var query = _context.DeviceRawDataHour.AsQueryable();

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
    }
}
