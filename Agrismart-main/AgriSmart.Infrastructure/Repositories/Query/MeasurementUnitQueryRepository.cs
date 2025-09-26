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
    public class MeasurementUnitQueryRepository : BaseQueryRepository<MeasurementUnit>, IMeasurementUnitQueryRepository
    {
        protected readonly AgriSmartContext _context;
        public MeasurementUnitQueryRepository(AgriSmartContext context, IOptions<AgriSmartDbConfiguration> dbConfiguration, IHttpContextAccessor httpContextAccessor) : base(dbConfiguration, httpContextAccessor)
        {
            _context = context;
        }

        public async Task<IReadOnlyList<MeasurementUnit>> GetAllAsync(bool includeInactives = false)
        {
            try
            {
                return await _context.MeasurementUnit
                    .Where(record => record.Active == true)
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
