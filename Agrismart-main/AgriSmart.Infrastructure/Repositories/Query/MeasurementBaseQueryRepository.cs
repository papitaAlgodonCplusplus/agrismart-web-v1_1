using AgriSmart.Core.Configuration;
using AgriSmart.Infrastructure.Data;
using AgriSmart.Core.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Options;
using System.Data;
using AgriSmart.Core.Repositories.Queries;
using Microsoft.AspNetCore.Http;
using AgriSmart.Application.Agronomic.Resources;


namespace AgriSmart.Infrastructure.Repositories.Query
{
    public class MeasurementBaseQueryRepository : BaseQueryRepository<MeasurementBase>, IMeasurementBaseQueryRepository
    {
        protected readonly AgriSmartContext _context;
        public MeasurementBaseQueryRepository(AgriSmartContext context, IOptions<AgriSmartDbConfiguration> dbConfiguration, IHttpContextAccessor httpContextAccessor) : base(dbConfiguration, httpContextAccessor)
        {
            _context = context;
        }

        public async Task<IReadOnlyList<MeasurementBase>> GetAllAsync(DateTime periodStartingDate, DateTime periodEndingDate, int cropProductionId = 0, int measurementVariableId = 0)
        {
            try
            {
                return await _context.MeasurementBase
                    .Where(record => (record.CropProductionId == cropProductionId || cropProductionId == 0) &&
                        (record.MeasurementVariableId == measurementVariableId || measurementVariableId == 0) &&  
                        record.RecordDate >= periodStartingDate && record.RecordDate <= periodEndingDate)
                        .AsNoTracking()
                        .ToListAsync();

            }
            catch (Exception ex)
            {
                throw new Exception(ex.Message, ex);
            }
        }

    }
}
