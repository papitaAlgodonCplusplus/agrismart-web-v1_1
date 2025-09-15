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
    public class MeasurementVariablesStandardQueryRepository : BaseQueryRepository<MeasurementVariableStandard>, IMeasurementVariableStandardQueryRepository
    {
        protected readonly AgriSmartContext _context;
        public MeasurementVariablesStandardQueryRepository(AgriSmartContext context, IOptions<AgriSmartDbConfiguration> dbConfiguration, IHttpContextAccessor httpContextAccessor) : base(dbConfiguration, httpContextAccessor)
        {
            _context = context;
        }

        public async Task<IReadOnlyList<MeasurementVariableStandard>> GetAllAsync(bool includeInactives = false)
        {
            try
            {
                return await (from mv in _context.MeasurementVariableStandard
                              where
                                  ((mv.Active && !includeInactives) || includeInactives)
                              select mv).ToListAsync();
            }
            catch (Exception ex)
            {
                throw new Exception(ex.Message, ex);
            }
        }

    }
}
