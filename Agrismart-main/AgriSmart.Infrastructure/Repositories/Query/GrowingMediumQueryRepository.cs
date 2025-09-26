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
    public class GrowingMediumQueryRepository : BaseQueryRepository<GrowingMedium>, IGrowingMediumQueryRepository
    {
        protected readonly AgriSmartContext _context;
        public GrowingMediumQueryRepository(AgriSmartContext context, IOptions<AgriSmartDbConfiguration> dbConfiguration, IHttpContextAccessor httpContextAccessor) : base(dbConfiguration, httpContextAccessor)
        {
            _context = context;
        }

        public async Task<IReadOnlyList<GrowingMedium>> GetAllAsync(int catalogId = 0, bool includeInactives = false)
        {
            try
            {
                return await (from gm in _context.GrowingMedium
                              join ca in _context.Catalog on gm.CatalogId equals ca.Id
                              where (
                                        (ca.ClientId == GetSessionClientId() && GetSessionProfileId() == (int)Profiles.CompanyUser) ||
                                        (ca.ClientId == GetSessionClientId() && GetSessionProfileId() == (int)Profiles.ClientAdmin) ||
                                        (GetSessionProfileId() == (int)Profiles.SuperUser)
                                    )
                                    && ((ca.Id == catalogId) || catalogId == 0)
                                    && (((gm.Active == true) && !includeInactives) || includeInactives)
                              select new GrowingMedium
                              {
                                  Id = gm.Id,
                                  CatalogId = gm.CatalogId,
                                  Name = gm.Name,
                                  ContainerCapacityPercentage = gm.ContainerCapacityPercentage,
                                  PermanentWiltingPoint = gm.PermanentWiltingPoint,
                                  Active = (gm.Active ?? false),
                                  DateCreated = gm.DateCreated,
                                  DateUpdated = gm.DateUpdated,
                                  CreatedBy = gm.CreatedBy,
                                  UpdatedBy = gm.UpdatedBy
                              }).ToListAsync();

            }
            catch (Exception ex)
            {
                throw new Exception(ex.Message, ex);
            }
        }

        public async Task<GrowingMedium?> GetByIdAsync(int id)
        {
            try
            {
                return await (from gm in _context.GrowingMedium
                              join ca in _context.Catalog on gm.CatalogId equals ca.Id
                              where (
                                        (ca.ClientId == GetSessionClientId() && GetSessionProfileId() == (int)Profiles.CompanyUser) ||
                                        (ca.ClientId == GetSessionClientId() && GetSessionProfileId() == (int)Profiles.ClientAdmin) ||
                                        (GetSessionProfileId() == (int)Profiles.SuperUser)
                                    )
                                    && (gm.Id == id)
                              select new GrowingMedium
                              {
                                  Id = gm.Id,
                                  CatalogId = gm.CatalogId,
                                  Name = gm.Name,
                                  ContainerCapacityPercentage = gm.ContainerCapacityPercentage,
                                  PermanentWiltingPoint = gm.PermanentWiltingPoint,
                                  Active = (gm.Active ?? false),
                                  DateCreated = gm.DateCreated,
                                  DateUpdated = gm.DateUpdated,
                                  CreatedBy = gm.CreatedBy,
                                  UpdatedBy = gm.UpdatedBy
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
