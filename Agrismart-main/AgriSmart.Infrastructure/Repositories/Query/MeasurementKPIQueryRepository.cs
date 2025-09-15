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
    public class MeasurementKPIQueryRepository : BaseQueryRepository<MeasurementKPI>, IMeasurementKPIQueryRepository
    {
        protected readonly AgriSmartContext _context;
        public MeasurementKPIQueryRepository(AgriSmartContext context, IOptions<AgriSmartDbConfiguration> dbConfiguration, IHttpContextAccessor httpContextAccessor) : base(dbConfiguration, httpContextAccessor)
        {
            _context = context;
        }

        public async Task<IReadOnlyList<MeasurementKPI>> GetAllAsync(DateTime periodStartingDate, DateTime periodEndingDate, int cropProductionId = 0, int kpiId = 0)
        {
            try
            {
                return await _context.MeasurementKPI
                    .Where(record => (record.CropProductionId == cropProductionId || cropProductionId == 0) &&
                        (record.KPIId == kpiId || kpiId == 0) &&  
                        record.RecordDate >= periodStartingDate && record.RecordDate <= periodEndingDate)
                        .AsNoTracking()
                        .ToListAsync();


            }
            catch (Exception ex)
            {
                throw new Exception(ex.Message, ex);
            }
        }

        public async Task<MeasurementKPI> GetLatestAsync(DateTime periodStartingDate, DateTime periodEndingDate, int cropProductionId = 0, int kpiId = 0)
        {
            try
            {
                return await _context.MeasurementKPI
                    .Where(record => (record.CropProductionId == cropProductionId || cropProductionId == 0) &&
                        (record.KPIId == kpiId || kpiId == 0) &&
                        record.RecordDate >= periodStartingDate && record.RecordDate <= periodEndingDate).OrderByDescending(x => x.RecordDate)
                        .FirstOrDefaultAsync();

            }
            catch (Exception ex)
            {
                throw new Exception(ex.Message, ex);
            }
        }

    }
}
