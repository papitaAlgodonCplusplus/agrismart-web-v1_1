using AgriSmart.Core.Configuration;
using AgriSmart.Infrastructure.Data;
using AgriSmart.Core.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Options;
using System.Data;
using AgriSmart.Core.Repositories.Queries;
using Microsoft.AspNetCore.Http;

namespace AgriSmart.Infrastructure.Repositories.Query
{
    public class ClimateMeasurementQueryRepository : BaseQueryRepository<ClimateMeasurement>, IClimateMeasurementQueryRepository
    {
        protected readonly AgriSmartContext _context;
        public ClimateMeasurementQueryRepository(AgriSmartContext context, IOptions<AgriSmartDbConfiguration> dbConfiguration, IHttpContextAccessor httpContextAccessor) : base(dbConfiguration, httpContextAccessor)
        {
            _context = context;
        }

        public async Task<IEnumerable<ClimateMeasurement>> GetAllByDeviceAsync(long deviceId)
        {
            try
            {
                /*return await _context.Sensor
                    .Select(record => new Sensor()
                    {
                        Id = record.Id,
                        DeviceId = record.DeviceId,
                        SensorLabel = record.SensorLabel,
                        Description = record.Description,
                        Active = (record.Active ?? false),
                        DateCreated = record.DateCreated,
                        DateUpdated = record.DateUpdated,
                        CreatedBy = record.CreatedBy,
                        UpdatedBy = record.UpdatedBy
                    }).Where(record => record.DeviceId == deviceId && record.Active)
                    .AsNoTracking()
                    .ToListAsync();
                */
                return null;
            }
            catch (Exception ex)
            {
                throw new Exception(ex.Message, ex);
            }
        }
    }
}
