using AgriSmart.Infrastructure.Data;
using AgriSmart.Core.Entities;
using AgriSmart.Core.Repositories.Commands;
using Microsoft.AspNetCore.Http;

namespace AgriSmart.Infrastructure.Repositories.Command
{
    public class CropProductionIrrigationSectorCommandRepository : BaseCommandRepository<CropProductionIrrigationSector>, ICropProductionIrrigationSectorCommandRepository
    {
        public CropProductionIrrigationSectorCommandRepository(AgriSmartContext context, IHttpContextAccessor httpContextAccessor) : base(context, httpContextAccessor)
        {
           
        }
    }
}
