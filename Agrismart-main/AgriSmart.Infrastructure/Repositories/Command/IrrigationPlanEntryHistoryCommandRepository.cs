using AgriSmart.Infrastructure.Data;
using AgriSmart.Core.Entities;
using AgriSmart.Core.Repositories.Commands;
using Microsoft.AspNetCore.Http;

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
    }
}
