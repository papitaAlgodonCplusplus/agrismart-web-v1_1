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
    public class CropQueryRepository : BaseQueryRepository<Crop>, ICropQueryRepository
    {
        protected readonly AgriSmartContext _context;
        public CropQueryRepository(AgriSmartContext context, IOptions<AgriSmartDbConfiguration> dbConfiguration, IHttpContextAccessor httpContextAccessor) : base(dbConfiguration, httpContextAccessor)
        {
            _context = context;
        }

        public async Task<IReadOnlyList<Crop>> GetAllAsync(bool includeInactives = false)
        {
            try
            {
                return await _context.Crop
                    .Where(record => record.Active == true)
                    .AsNoTracking()
                    .ToListAsync();                    
            }
            catch (Exception ex)
            {
                throw new Exception(ex.Message, ex);
            }
        }

        public async Task<Crop?> GetByIdAsync(int id)
        {
            try
            {
                return await (from c in _context.Crop
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
