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
    public class UserStatusQueryRepository : BaseQueryRepository<UserStatus>, IUserStatusQueryRepository
    {
        protected readonly AgriSmartContext _context;
        public UserStatusQueryRepository(AgriSmartContext context, IOptions<AgriSmartDbConfiguration> dbConfiguration, IHttpContextAccessor httpContextAccessor) : base(dbConfiguration, httpContextAccessor)
        {
            _context = context;
        }


        public async Task<IReadOnlyList<UserStatus>> GetAllAsync(bool includeInactives = false)
        {
            try
            {
                return await (from us in _context.UserStatus
                              where
                                  (((us.Active == true) && !includeInactives) || includeInactives)
                              select us).ToListAsync();
            }
            catch (Exception ex)
            {
                throw new Exception(ex.Message, ex);
            }
        }
    }
}