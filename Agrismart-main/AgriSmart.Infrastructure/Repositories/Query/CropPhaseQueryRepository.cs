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
    public class CropPhaseQueryRepository : BaseQueryRepository<CropPhase>, ICropPhaseQueryRepository
    {
        protected readonly AgriSmartContext _context;
        public CropPhaseQueryRepository(AgriSmartContext context, IOptions<AgriSmartDbConfiguration> dbConfiguration, IHttpContextAccessor httpContextAccessor) : base(dbConfiguration, httpContextAccessor)
        {
            _context = context;
        }

        public async Task<IReadOnlyList<CropPhase>> GetAllAsync(int cropId = 0, int catalogId = 0, bool includeInactives = false)
        {
            try
            {
                return await (from cp in _context.CropPhase
                              join ca in _context.Catalog on cp.CatalogId equals ca.Id
                              where (
                                        (ca.ClientId == GetSessionClientId() && GetSessionProfileId() == (int)Profiles.CompanyUser) ||
                                        (ca.ClientId == GetSessionClientId() && GetSessionProfileId() == (int)Profiles.ClientAdmin) ||
                                        (GetSessionProfileId() == (int)Profiles.SuperUser)
                                    )                                    
                                    && ((cp.CropId == cropId) || cropId == 0)
                                    && ((cp.CatalogId == catalogId) || catalogId == 0)
                                    && (((cp.Active == true) && !includeInactives) || includeInactives)
                              select new CropPhase
                              {
                                  Id = cp.Id,
                                  CropId = cp.CropId,
                                  CatalogId = cp.CatalogId,
                                  Name = cp.Name,
                                  Description = cp.Description,
                                  Sequence = cp.Sequence,
                                  StartingWeek = cp.StartingWeek,
                                  EndingWeek = cp.EndingWeek,
                                  Active = (cp.Active ?? false),
                                  CreatedBy = cp.CreatedBy,
                                  DateCreated = cp.DateCreated,
                                  UpdatedBy = cp.UpdatedBy,
                                  DateUpdated = cp.DateUpdated
                              }).ToListAsync();
            }
            catch (Exception ex)
            {
                throw new Exception(ex.Message, ex);
            }
        }
        public async Task<CropPhase?> GetByIdAsync(int id)
        {
            try
            {
                return await (from cp in _context.CropPhase
                              join ca in _context.Catalog on cp.CatalogId equals ca.Id
                              where (
                                        (ca.ClientId == GetSessionClientId() && GetSessionProfileId() == (int)Profiles.CompanyUser) ||
                                        (ca.ClientId == GetSessionClientId() && GetSessionProfileId() == (int)Profiles.ClientAdmin) ||
                                        (GetSessionProfileId() == (int)Profiles.SuperUser)
                                    )
                                    && (cp.Id == id)
                              select new CropPhase
                              {
                                  Id = cp.Id,
                                  CropId = cp.CropId,
                                  CatalogId = cp.CatalogId,
                                  Name = cp.Name,
                                  Description = cp.Description,
                                  Sequence = cp.Sequence,
                                  StartingWeek = cp.StartingWeek,
                                  EndingWeek = cp.EndingWeek,
                                  Active = (cp.Active ?? false),
                                  CreatedBy = cp.CreatedBy,
                                  DateCreated = cp.DateCreated,
                                  UpdatedBy = cp.UpdatedBy,
                                  DateUpdated = cp.DateUpdated
                              }).FirstOrDefaultAsync();
            }
            catch (Exception ex)
            {
                throw new Exception(ex.Message, ex);
            }
        }
    }
}
