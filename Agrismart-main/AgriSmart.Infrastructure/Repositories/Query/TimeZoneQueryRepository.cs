using AgriSmart.Core.Configuration;
using AgriSmart.Infrastructure.Data;
using AgriSmart.Core.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Options;
using System.Data;
using AgriSmart.Core.Repositories.Queries;
using Microsoft.AspNetCore.Http;
using AgriSmart.Application.Agronomic.Resources;
using TimeZone = AgriSmart.Core.Entities.TimeZone;

namespace AgriSmart.Infrastructure.Repositories.Query
{
    public class TimeZoneQueryRepository : BaseQueryRepository<TimeZone>, ITimeZoneQueryRepository
    {
        protected readonly AgriSmartContext _context;
        public TimeZoneQueryRepository(AgriSmartContext context, IOptions<AgriSmartDbConfiguration> dbConfiguration, IHttpContextAccessor httpContextAccessor) : base(dbConfiguration, httpContextAccessor)
        {
            _context = context;
        }

        public async Task<IReadOnlyList<TimeZone>> GetAllAsync(bool includeInactives = false)
        {
            try
            {
                return await _context.TimeZone
                    .Where(record => record.Active)
                    .AsNoTracking()
                    .ToListAsync();                    
            }
            catch (Exception ex)
            {
                throw new Exception(ex.Message, ex);
            }
        }

        public async Task<TimeZone> GetByIdAsync(int id)
        {
            try
            {
                return await _context.TimeZone
                    .Where(record => record.Id == id)
                    .AsNoTracking()
                    .FirstOrDefaultAsync();
            }
            catch (Exception ex)
            {
                throw new Exception(ex.Message, ex);
            }
        }
    }
}
