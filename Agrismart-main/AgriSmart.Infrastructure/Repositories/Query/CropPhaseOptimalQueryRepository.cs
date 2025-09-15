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
    public class CropPhaseOptimalQueryRepository : BaseQueryRepository<CropPhaseOptimal>, ICropPhaseOptimalQueryRepository
    {
        protected readonly AgriSmartContext _context;
        public CropPhaseOptimalQueryRepository(AgriSmartContext context, IOptions<AgriSmartDbConfiguration> dbConfiguration, IHttpContextAccessor httpContextAccessor) : base(dbConfiguration, httpContextAccessor)
        {
            _context = context;
        }

        public async Task<IReadOnlyList<CropPhaseOptimal>> GetAllAsync(int catalogId = 0, bool includeInactives = false)
        {
            try
            {
                return await (from cpo in _context.CropPhaseOptimal
                              join ca in _context.Catalog on cpo.CatalogId equals ca.Id
                              where (
                                        (ca.ClientId == GetSessionClientId() && GetSessionProfileId() == (int)Profiles.CompanyUser) ||
                                        (ca.ClientId == GetSessionClientId() && GetSessionProfileId() == (int)Profiles.ClientAdmin) ||
                                        (GetSessionProfileId() == (int)Profiles.SuperUser)
                                    )                                    
                                    && ((cpo.CatalogId == catalogId) || catalogId == 0)
                                    && ((cpo.Active && !includeInactives) || includeInactives)
                              select new CropPhaseOptimal
                              {
                                  Id = cpo.Id,
                                  CatalogId = cpo.CatalogId,
                                  Name = cpo.Name,
                                  Description = cpo.Description,
                                  Value = cpo.Value,
                                  Active = cpo.Active,
                                  CreatedBy = cpo.CreatedBy,
                                  DateCreated = cpo.DateCreated,
                                  UpdatedBy = cpo.UpdatedBy,
                                  DateUpdated = cpo.DateUpdated
                              }).ToListAsync();
            }
            catch (Exception ex)
            {
                throw new Exception(ex.Message, ex);
            }
        }
        public async Task<CropPhaseOptimal?> GetByIdAsync(int id)
        {
            try
            {
                return await (from cpo in _context.CropPhaseOptimal
                              join ca in _context.Catalog on cpo.CatalogId equals ca.Id
                              where (
                                        (ca.ClientId == GetSessionClientId() && GetSessionProfileId() == (int)Profiles.CompanyUser) ||
                                        (ca.ClientId == GetSessionClientId() && GetSessionProfileId() == (int)Profiles.ClientAdmin) ||
                                        (GetSessionProfileId() == (int)Profiles.SuperUser)
                                    )
                                    && (cpo.Id == id)
                              select new CropPhaseOptimal
                              {
                                  Id = cpo.Id,
                                  CatalogId = cpo.CatalogId,
                                  Name = cpo.Name,
                                  Description = cpo.Description,
                                  Value = cpo.Value,
                                  Active = cpo.Active,
                                  CreatedBy = cpo.CreatedBy,
                                  DateCreated = cpo.DateCreated,
                                  UpdatedBy = cpo.UpdatedBy,
                                  DateUpdated = cpo.DateUpdated
                              }).FirstOrDefaultAsync();
            }
            catch (Exception ex)
            {
                throw new Exception(ex.Message, ex);
            }
        }
    }
}
