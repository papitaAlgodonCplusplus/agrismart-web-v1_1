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
    public class IrrigationEventQueryRepository : BaseQueryRepository<IrrigationEvent>, IIrrigationEventQueryRepository
    {
        protected readonly AgriSmartContext _context;
        public IrrigationEventQueryRepository(AgriSmartContext context, IOptions<AgriSmartDbConfiguration> dbConfiguration, IHttpContextAccessor httpContextAccessor) : base(dbConfiguration, httpContextAccessor)
        {
            _context = context;
        }

        public async Task<IReadOnlyList<IrrigationEvent>> GetAllAsync(int cropProductionId, DateTime startingDateTime, DateTime endigDateTime)
        {
            try
            {
                return await _context.IrrigationEvent
                    .Where(record => record.CropProductionId == cropProductionId &&
                     record.RecordDateTime >= startingDateTime && record.RecordDateTime <= endigDateTime)
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
