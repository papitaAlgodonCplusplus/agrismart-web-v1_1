using AgriSmart.Core.Configuration;
using AgriSmart.Infrastructure.Data;
using AgriSmart.Core.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Options;
using System.Data;
using AgriSmart.Core.Repositories.Queries;
using Microsoft.AspNetCore.Http;
using AgriSmart.Core.Enums;



namespace AgriSmart.Infrastructure.Repositories.Query
{
    public class CatalogQueryRepository : BaseQueryRepository<Catalog>, ICatalogQueryRepository
    {
        protected readonly AgriSmartContext _context;
        public CatalogQueryRepository(AgriSmartContext context, IOptions<AgriSmartDbConfiguration> dbConfiguration, IHttpContextAccessor httpContextAccessor) : base(dbConfiguration, httpContextAccessor)
        {
            _context = context;
        }
        public async Task<IReadOnlyList<Catalog>> GetAllAsync(int clientId, bool includeInactives = false)
        {
            try
            {
                return await (from c in _context.Catalog
                    where (
                            (c.ClientId == GetSessionClientId() && GetSessionProfileId() == (int)Profiles.CompanyUser) ||
                            (c.ClientId == GetSessionClientId() && GetSessionProfileId() == (int)Profiles.ClientAdmin) ||
                            (GetSessionProfileId() == (int)Profiles.SuperUser)
                        )
                        && ((c.ClientId == clientId) || clientId == 0)
                        && (((c.Active == true) && !includeInactives) || includeInactives)
                    select c).ToListAsync();
            }
            catch (Exception ex)
            {
                throw new Exception(ex.Message, ex);
            }
        }

        public async Task<Catalog?> GetByIdAsync(int id)
        {
            try
            {
                return await (from c in _context.Catalog
                              where (
                                        (c.Id == GetSessionClientId() && GetSessionProfileId() == (int)Profiles.CompanyUser) ||
                                        (c.Id == GetSessionClientId() && GetSessionProfileId() == (int)Profiles.ClientAdmin) ||
                                        (GetSessionProfileId() == (int)Profiles.SuperUser)
                                    )
                                     && (c.Id == id)
                              select c).FirstOrDefaultAsync();


            }
            catch (Exception ex)
            {
                throw new Exception(ex.Message, ex);
            }
        }
    }
}
