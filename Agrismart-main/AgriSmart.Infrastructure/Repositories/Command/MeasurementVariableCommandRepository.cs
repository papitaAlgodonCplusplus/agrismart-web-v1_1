using AgriSmart.Infrastructure.Data;
using AgriSmart.Core.Entities;
using AgriSmart.Core.Repositories.Commands;
using Microsoft.AspNetCore.Http;

namespace AgriSmart.Infrastructure.Repositories.Command
{
    public class MeasurementVariableCommandRepository : BaseCommandRepository<MeasurementVariable>, IMeasurementVariableCommandRepository
    {
        public MeasurementVariableCommandRepository(AgriSmartContext context, IHttpContextAccessor httpContextAccessor) : base(context, httpContextAccessor)
        {
            
        }
    }
}
