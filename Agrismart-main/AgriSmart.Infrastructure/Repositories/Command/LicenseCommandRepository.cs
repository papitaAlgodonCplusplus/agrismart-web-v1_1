using AgriSmart.Infrastructure.Data;
using AgriSmart.Core.Entities;
using AgriSmart.Core.Repositories.Commands;
using Microsoft.AspNetCore.Http;

namespace AgriSmart.Infrastructure.Repositories.Command
{
    public class LicenseCommandRepository : BaseCommandRepository<License>, ILicenseCommandRepository
    {
        public LicenseCommandRepository(AgriSmartContext context, IHttpContextAccessor httpContextAccessor) : base(context, httpContextAccessor)
        {
            
        }
    }
}
