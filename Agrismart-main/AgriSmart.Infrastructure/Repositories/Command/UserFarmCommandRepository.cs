using AgriSmart.Infrastructure.Data;
using AgriSmart.Core.Entities;
using AgriSmart.Core.Repositories.Commands;
using Microsoft.AspNetCore.Http;

namespace AgriSmart.Infrastructure.Repositories.Command
{
    public class UserFarmCommandRepository : BaseCommandRepository<UserFarm>, IUserFarmCommandRepository
    {
        public UserFarmCommandRepository(AgriSmartContext context, IHttpContextAccessor httpContextAccessor) : base(context, httpContextAccessor)
        {
            
        }
    }
}
