using AgriSmart.Infrastructure.Data;
using AgriSmart.Core.Entities;
using AgriSmart.Core.Repositories.Commands;
using Microsoft.AspNetCore.Http;

namespace AgriSmart.Infrastructure.Repositories.Command
{
    public class RelayModuleCropProductionIrrigationSectorCommandRepository : BaseCommandRepository<RelayModuleCropProductionIrrigationSector>, IRelayModuleCropProductionIrrigationSectorCommandRepository
    {
        public RelayModuleCropProductionIrrigationSectorCommandRepository(AgriSmartContext context, IHttpContextAccessor httpContextAccessor) : base(context, httpContextAccessor)
        {
            
        }
    }
}
