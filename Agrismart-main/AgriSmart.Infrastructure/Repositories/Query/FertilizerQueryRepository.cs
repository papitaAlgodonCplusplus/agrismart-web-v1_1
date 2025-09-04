using AgriSmart.Core.Configuration;
using AgriSmart.Infrastructure.Data;
using AgriSmart.Core.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Options;
using System.Data;
using AgriSmart.Core.Repositories.Queries;
using Microsoft.AspNetCore.Http;
using AgriSmart.Application.Agronomic.Resources;


namespace AgriSmart.Infrastructure.Repositories.Query
{
    public class FertilizerQueryRepository : BaseQueryRepository<Fertilizer>, IFertilizerQueryRepository
    {
        protected readonly AgriSmartContext _context;
        public FertilizerQueryRepository(AgriSmartContext context, IOptions<AgriSmartDbConfiguration> dbConfiguration, IHttpContextAccessor httpContextAccessor) : base(dbConfiguration, httpContextAccessor)
        {
            _context = context;
        }

        public async Task<IReadOnlyList<Fertilizer>> GetAllAsync(int catalogId = 0, bool includeInactives = false)
        {
            try
            {
                return await (from f in _context.Fertilizer
                              join ca in _context.Catalog on f.CatalogId equals ca.Id
                              where (
                                        (ca.ClientId == GetSessionClientId() && GetSessionProfileId() == (int)Profiles.CompanyUser) ||
                                        (ca.ClientId == GetSessionClientId() && GetSessionProfileId() == (int)Profiles.ClientAdmin) ||
                                        (GetSessionProfileId() == (int)Profiles.SuperUser)
                                    )
                                    && ((ca.Id == catalogId) || catalogId == 0)
                                    && ((f.Active && !includeInactives) || includeInactives)
                              select new Fertilizer
                              {
                                  Id = f.Id,
                                  CatalogId = f.CatalogId,
                                  Name = f.Name,
                                  Manufacturer = f.Manufacturer,
                                  IsLiquid = f.IsLiquid,
                                  Active = f.Active,
                                  DateCreated = f.DateCreated,
                                  DateUpdated = f.DateUpdated,
                                  CreatedBy = f.CreatedBy,
                                  UpdatedBy = f.UpdatedBy
                              }).ToListAsync();                 
            }
            catch (Exception ex)
            {
                throw new Exception(ex.Message, ex);
            }
        }

        public async Task<Fertilizer> GetByIdAsync(int id)
        {
            try
            {
                return await (from f in _context.Fertilizer
                              join ca in _context.Catalog on f.CatalogId equals ca.Id
                              where (
                                        (ca.ClientId == GetSessionClientId() && GetSessionProfileId() == (int)Profiles.CompanyUser) ||
                                        (ca.ClientId == GetSessionClientId() && GetSessionProfileId() == (int)Profiles.ClientAdmin) ||
                                        (GetSessionProfileId() == (int)Profiles.SuperUser)
                                    )
                                    && (f.Id == id)
                              select new Fertilizer
                              {
                                  Id = f.Id,
                                  CatalogId = f.CatalogId,
                                  Name = f.Name,
                                  Manufacturer = f.Manufacturer,
                                  IsLiquid = f.IsLiquid,
                                  Active = f.Active,
                                  DateCreated = f.DateCreated,
                                  DateUpdated = f.DateUpdated,
                                  CreatedBy = f.CreatedBy,
                                  UpdatedBy = f.UpdatedBy
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
