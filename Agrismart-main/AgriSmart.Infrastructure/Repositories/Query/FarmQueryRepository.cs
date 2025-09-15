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
    public class FarmQueryRepository : BaseQueryRepository<Farm>, IFarmQueryRepository
    {
        protected readonly AgriSmartContext _context;
        public FarmQueryRepository(AgriSmartContext context, IOptions<AgriSmartDbConfiguration> dbConfiguration, IHttpContextAccessor httpContextAccessor) : base(dbConfiguration, httpContextAccessor)
        {
            _context = context;
        }

        public async Task<IReadOnlyList<Farm>> GetAllAsync(int clientId = 0, int companyId = 0, int userId = 0, bool includeInactives = false)
        {
            try
            {
                return await (from f in _context.Farm
                              join c in _context.Company on f.CompanyId equals c.Id
                              join uf in _context.UserFarm on f.Id equals uf.FarmId into userFarms
                              from juf in userFarms.DefaultIfEmpty()
                              join u in _context.User on juf.UserId equals u.Id into users
                              from ju in users.DefaultIfEmpty()
                              where
                                 (
                                     (juf.UserId == GetSessionUserId() && GetSessionProfileId() == (int)Profiles.CompanyUser) ||
                                     (c.ClientId == GetSessionClientId() && GetSessionProfileId() == (int)Profiles.ClientAdmin) ||
                                     (GetSessionProfileId() == (int)Profiles.SuperUser)
                                 )
                                 && ((c.ClientId == clientId) || clientId == 0)
                                 && ((f.CompanyId == companyId) || companyId == 0)
                                 && ((f.Active && !includeInactives) || includeInactives)
                                 && ((c.ClientId == (from u in _context.User where u.Id == userId select u).FirstOrDefault().ClientId) || userId == 0)
                              group f by f.Id into fg
                              select new Farm
                              {
                                  Id = fg.Key,
                                  CompanyId = fg.FirstOrDefault().CompanyId,
                                  Name = fg.FirstOrDefault().Name,
                                  Description = fg.FirstOrDefault().Description,
                                  TimeZoneId = fg.FirstOrDefault().TimeZoneId,
                                  Active = fg.FirstOrDefault().Active,
                                  CreatedBy = fg.FirstOrDefault().CreatedBy,
                                  DateCreated = fg.FirstOrDefault().DateCreated,
                                  UpdatedBy = fg.FirstOrDefault().UpdatedBy,
                                  DateUpdated = fg.FirstOrDefault().DateUpdated
                              })
                             .ToListAsync();
            }
            catch (Exception ex)
            {
                throw new Exception(ex.Message, ex);
            }
        }

        public async Task<Farm?> GetByIdAsync(int id)
        {
            try
            {
                return await (from f in _context.Farm
                              join c in _context.Company on f.CompanyId equals c.Id
                              join uf in _context.UserFarm on f.Id equals uf.FarmId into userFarms
                              from userFarm in userFarms.DefaultIfEmpty()
                              where
                                  (
                                      (userFarm.UserId == GetSessionUserId() && GetSessionProfileId() == (int)Profiles.CompanyUser) ||
                                      (c.ClientId == GetSessionClientId() && GetSessionProfileId() == (int)Profiles.ClientAdmin) ||
                                      (GetSessionProfileId() == (int)Profiles.SuperUser)
                                  )
                                  && (f.Id == id)
                              group f by f.Id into fg
                              select new Farm
                              {
                                  Id = fg.Key,
                                  CompanyId = fg.FirstOrDefault().CompanyId,
                                  Name = fg.FirstOrDefault().Name,
                                  Description = fg.FirstOrDefault().Description,
                                  TimeZoneId = fg.FirstOrDefault().TimeZoneId,
                                  Active = fg.FirstOrDefault().Active,
                                  CreatedBy = fg.FirstOrDefault().CreatedBy,
                                  DateCreated = fg.FirstOrDefault().DateCreated,
                                  UpdatedBy = fg.FirstOrDefault().UpdatedBy,
                                  DateUpdated = fg.FirstOrDefault().DateUpdated
                              })
                             .FirstOrDefaultAsync();
            }
            catch (Exception ex)
            {
                throw new Exception(ex.Message, ex);
            }
        }
    }
}
