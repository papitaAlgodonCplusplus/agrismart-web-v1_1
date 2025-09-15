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
    public class CalculationSettingQueryRepository : BaseQueryRepository<CalculationSetting>, ICalculationSettingQueryRepository
    {
        protected readonly AgriSmartContext _context;
        public CalculationSettingQueryRepository(AgriSmartContext context, IOptions<AgriSmartDbConfiguration> dbConfiguration, IHttpContextAccessor httpContextAccessor) : base(dbConfiguration, httpContextAccessor)
        {
            _context = context;
        }

        public async Task<IReadOnlyList<CalculationSetting>> GetAllAsync(int catalogId = 0, bool includeInactives = false)
        {
            try
            {
                return await (from cs in _context.CalculationSetting
                              join ca in _context.Catalog on cs.CatalogId equals ca.Id
                              where (
                                        (ca.ClientId == GetSessionClientId() && GetSessionProfileId() == (int)Profiles.CompanyUser) ||
                                        (ca.ClientId == GetSessionClientId() && GetSessionProfileId() == (int)Profiles.ClientAdmin) ||
                                        (GetSessionProfileId() == (int)Profiles.SuperUser)
                                    )                                    
                                    && ((cs.CatalogId == catalogId) || catalogId == 0)
                                    && ((cs.Active && !includeInactives) || includeInactives)
                              select new CalculationSetting
                              {
                                  Id = cs.Id,
                                  CatalogId = cs.CatalogId,
                                  Name = cs.Name,
                                  Value = cs.Value,
                                  Active = cs.Active,
                                  CreatedBy = cs.CreatedBy,
                                  DateCreated = cs.DateCreated,
                                  UpdatedBy = cs.UpdatedBy,
                                  DateUpdated = cs.DateUpdated
                              }).ToListAsync();
            }
            catch (Exception ex)
            {
                throw new Exception(ex.Message, ex);
            }
        }
        public async Task<CalculationSetting?> GetByIdAsync(int id)
        {
            try
            {
                return await (from cs in _context.CalculationSetting
                              join ca in _context.Catalog on cs.CatalogId equals ca.Id
                              where (
                                        (ca.ClientId == GetSessionClientId() && GetSessionProfileId() == (int)Profiles.CompanyUser) ||
                                        (ca.ClientId == GetSessionClientId() && GetSessionProfileId() == (int)Profiles.ClientAdmin) ||
                                        (GetSessionProfileId() == (int)Profiles.SuperUser)
                                    )
                                    && (cs.Id == id)
                              select new CalculationSetting
                              {
                                  Id = cs.Id,
                                  CatalogId = cs.CatalogId,
                                  Name = cs.Name,
                                  Value = cs.Value,
                                  Active = cs.Active,
                                  CreatedBy = cs.CreatedBy,
                                  DateCreated = cs.DateCreated,
                                  UpdatedBy = cs.UpdatedBy,
                                  DateUpdated = cs.DateUpdated
                              }).FirstOrDefaultAsync();
            }
            catch (Exception ex)
            {
                throw new Exception(ex.Message, ex);
            }
        }
    }
}
