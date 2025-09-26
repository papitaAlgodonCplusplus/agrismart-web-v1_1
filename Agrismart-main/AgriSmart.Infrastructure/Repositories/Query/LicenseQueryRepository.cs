using AgriSmart.Core.Configuration;
using AgriSmart.Infrastructure.Data;
using AgriSmart.Core.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Options;
using System.Data;
using AgriSmart.Core.Repositories.Queries;
using Microsoft.AspNetCore.Http;
using AgriSmart.Core.Enums;

using Microsoft.EntityFrameworkCore.Metadata.Internal;


namespace AgriSmart.Infrastructure.Repositories.Query
{
    public class LicenseQueryRepository : BaseQueryRepository<License>, ILicenseQueryRepository
    {
        protected readonly AgriSmartContext _context;
        public LicenseQueryRepository(AgriSmartContext context, IOptions<AgriSmartDbConfiguration> dbConfiguration, IHttpContextAccessor httpContextAccessor) : base(dbConfiguration, httpContextAccessor)
        {
            _context = context;
        }

        public async Task<IReadOnlyList<License>> GetAllAsync(int clientId, bool includeInactives = false)
        {
            try
            {
                return await (from l in _context.License
                              where (
                                        (l.ClientId == GetSessionClientId() && GetSessionProfileId() == (int)Profiles.CompanyUser) ||
                                        (l.ClientId == GetSessionClientId() && GetSessionProfileId() == (int)Profiles.ClientAdmin) ||
                                        (GetSessionProfileId() == (int)Profiles.SuperUser)
                                    )
                                    && ((l.ClientId == clientId) || clientId == 0)
                                    && (((l.Active == true) && !includeInactives) || includeInactives)
                              select l).ToListAsync();
            }
            catch (Exception ex)
            {
                throw new Exception(ex.Message, ex);
            }
        }

        public async Task<License?> GetByIdAsync(int id)
        {
            try
            {
                return await (from l in _context.License
                              where (
                                        (l.ClientId == GetSessionClientId() && GetSessionProfileId() == (int)Profiles.CompanyUser) ||
                                        (l.ClientId == GetSessionClientId() && GetSessionProfileId() == (int)Profiles.ClientAdmin) ||
                                        (GetSessionProfileId() == (int)Profiles.SuperUser)
                                    )
                                     && (l.Id == id)
                              select l).FirstOrDefaultAsync();
            }
            catch (Exception ex)
            {
                throw new Exception(ex.Message, ex);
            }
        }
    }
}
