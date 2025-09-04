using AgriSmart.Core.Configuration;
using AgriSmart.Infrastructure.Data;
using AgriSmart.Core.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Options;
using System.Data;
using AgriSmart.Core.Repositories.Queries;
using Microsoft.AspNetCore.Http;

using Microsoft.EntityFrameworkCore.Metadata.Internal;
using AgriSmart.Application.Agronomic.Resources;


namespace AgriSmart.Infrastructure.Repositories.Query
{
    public class CompanyQueryRepository : BaseQueryRepository<Company>, ICompanyQueryRepository
    {
        protected readonly AgriSmartContext _context;
        public CompanyQueryRepository(AgriSmartContext context, IOptions<AgriSmartDbConfiguration> dbConfiguration, IHttpContextAccessor httpContextAccessor) : base(dbConfiguration, httpContextAccessor)
        {
            _context = context;
        }



        public async Task<IReadOnlyList<Company>> GetAllAsync(int clientId, bool includeInactives = false)
        {
            try
            {
                   return await (from c in _context.Company
                              join f in _context.Farm on c.Id equals f.CompanyId into AllCompanies
                              from jc in AllCompanies.DefaultIfEmpty()
                              join uf in _context.UserFarm on jc.Id equals uf.FarmId into userFarms
                              from userFarm in userFarms.DefaultIfEmpty()
                              where
                                  (
                                      (userFarm.UserId == GetSessionUserId() && GetSessionProfileId() == (int)Profiles.CompanyUser) ||
                                      (c.ClientId == GetSessionClientId() && GetSessionProfileId() == (int)Profiles.ClientAdmin) ||
                                      (GetSessionProfileId() == (int)Profiles.SuperUser) || (GetSessionProfileId() == (int)Profiles.Application)
                                  )
                                  && ((c.ClientId == clientId) || clientId == 0)
                                  && ((c.Active && !includeInactives) || includeInactives)
                              group c by c.Id into cg
                              select new Company
                              {
                                  Id = cg.Key,
                                  ClientId = cg.Max(cl => cl.ClientId),
                                  CatalogId = cg.FirstOrDefault().CatalogId,
                                  Name = cg.FirstOrDefault().Name,
                                  Description = cg.FirstOrDefault().Description,
                                  Active = cg.FirstOrDefault().Active,
                                  CreatedBy = cg.FirstOrDefault().CreatedBy,
                                  DateCreated = cg.FirstOrDefault().DateCreated,
                                  UpdatedBy = cg.FirstOrDefault().UpdatedBy,
                                  DateUpdated = cg.FirstOrDefault().DateUpdated
                              })
                              .ToListAsync();
            }
            catch (Exception ex)
            {
                throw new Exception(ex.Message, ex);
            }
        }

        public async Task<Company?> GetByIdAsync(int id, bool isIot = false)
        {
            try
            {
                return await (from c in _context.Company
                              join f in _context.Farm on c.Id equals f.CompanyId into AllCompanies
                              from jc in AllCompanies.DefaultIfEmpty()
                              join uf in _context.UserFarm on jc.Id equals uf.FarmId into userFarms
                              from userFarm in userFarms.DefaultIfEmpty()
                              where
                                  (
                                      (userFarm.UserId == GetSessionUserId() && GetSessionProfileId() == (int)Profiles.CompanyUser) ||
                                      (c.ClientId == GetSessionClientId() && GetSessionProfileId() == (int)Profiles.ClientAdmin) ||
                                      (GetSessionProfileId() == (int)Profiles.SuperUser) || isIot
                                  )
                                    && (c.Id == id)
                              group c by c.Id into cg
                              select new Company
                              {
                                  Id = cg.Key,
                                  ClientId =
                                  cg.Max(c => c.ClientId),
                                  CatalogId = cg.FirstOrDefault().CatalogId,
                                  Name = cg.FirstOrDefault().Name,
                                  Description = cg.FirstOrDefault().Description,
                                  Active = cg.FirstOrDefault().Active,
                                  CreatedBy = cg.FirstOrDefault().CreatedBy,
                                  DateCreated = cg.FirstOrDefault().DateCreated,
                                  UpdatedBy = cg.FirstOrDefault().UpdatedBy,
                                  DateUpdated = cg.FirstOrDefault().DateUpdated
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
