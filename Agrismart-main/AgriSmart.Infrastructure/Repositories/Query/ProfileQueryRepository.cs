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
    public class ProfileQueryRepository : BaseQueryRepository<Profile>, IProfileQueryRepository
    {
        protected readonly AgriSmartContext _context;
        public ProfileQueryRepository(AgriSmartContext context, IOptions<AgriSmartDbConfiguration> dbConfiguration, IHttpContextAccessor httpContextAccessor) : base(dbConfiguration, httpContextAccessor)
        {
            _context = context;
        }

        public async Task<IReadOnlyList<Profile>> GetAllAsync(bool includeInactives = false)
        {
            try
            {
                return await (from p in _context.Profile                             
                              where
                                  (((p.Active == true) && !includeInactives) || includeInactives)
                              select p).ToListAsync();
            }
            catch (Exception ex)
            {
                throw new Exception(ex.Message, ex);
            }
        }
    }
}