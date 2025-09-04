using AgriSmart.Infrastructure.Data;
using AgriSmart.Core.Entities;
using AgriSmart.Core.Repositories.Commands;
using Microsoft.AspNetCore.Http;

namespace AgriSmart.Infrastructure.Repositories.Command
{
    public class GrowingMediumCommandRepository : BaseCommandRepository<GrowingMedium>, IGrowingMediumCommandRepository
    {
        public GrowingMediumCommandRepository(AgriSmartContext context, IHttpContextAccessor httpContextAccessor) : base(context, httpContextAccessor)
        {           
        }
    }
}
