using AgriSmart.Infrastructure.Data;
using AgriSmart.Core.Entities;
using AgriSmart.Core.Repositories.Commands;
using Microsoft.AspNetCore.Http;
using System.Linq;

namespace AgriSmart.Infrastructure.Repositories.Command
{
    public class IrrigationPlanEntryHistoryCommandRepository : BaseCommandRepository<IrrigationPlanEntryHistory>, IIrrigationPlanEntryHistoryCommandRepository
    {
        public IrrigationPlanEntryHistoryCommandRepository(AgriSmartContext context, IHttpContextAccessor httpContextAccessor) : base(context, httpContextAccessor)
        {
        }

        public async Task<IrrigationPlanEntryHistory> AddAsync(IrrigationPlanEntryHistory history)
        {
            return await CreateAsync(history);
        }

        public async Task DeleteByIrrigationPlanEntryIdAsync(int irrigationPlanEntryId)
        {
            var histories = _context.Set<IrrigationPlanEntryHistory>()
                .Where(h => h.IrrigationPlanEntryId == irrigationPlanEntryId)
                .ToList();
            if (histories.Any())
            {
                _context.Set<IrrigationPlanEntryHistory>().RemoveRange(histories);
                await _context.SaveChangesAsync();
            }
        }
    }
}
