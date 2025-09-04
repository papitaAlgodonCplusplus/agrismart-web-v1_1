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
    public class FertilizerInputQueryRepository : BaseQueryRepository<FertilizerInput>, IFertilizerInputQueryRepository
    {
        protected readonly AgriSmartContext _context;
        public FertilizerInputQueryRepository(AgriSmartContext context, IOptions<AgriSmartDbConfiguration> dbConfiguration, IHttpContextAccessor httpContextAccessor) : base(dbConfiguration, httpContextAccessor)
        {
            _context = context;
        }

        public async Task<IReadOnlyList<FertilizerInput>> GetAllAsync(int catalogId = 0, int fertilizerId = 0, bool includeInactives = false)
        {
            try
            {
                return await (from fi in _context.FertilizerInput
                              join ca in _context.Catalog on fi.CatalogId equals ca.Id
                              join f in _context.Fertilizer on fi.FertilizerId equals f.Id
                              where (
                                        (ca.ClientId == GetSessionClientId() && GetSessionProfileId() == (int)Profiles.CompanyUser) ||
                                        (ca.ClientId == GetSessionClientId() && GetSessionProfileId() == (int)Profiles.ClientAdmin) ||
                                        (GetSessionProfileId() == (int)Profiles.SuperUser)
                                    )
                                    && ((ca.Id == catalogId) || catalogId == 0)
                                    && ((f.Id == fertilizerId) || fertilizerId == 0)
                                    && ((fi.Active && !includeInactives) || includeInactives)
                              select new FertilizerInput
                              {
                                  Id = fi.Id,
                                  CatalogId = fi.CatalogId,
                                  InputPresentationId = fi.InputPresentationId,
                                  FertilizerId = fi.FertilizerId,
                                  Name = fi.Name,
                                  Price = fi.Price,
                                  Active = fi.Active,
                                  CreatedBy = fi.CreatedBy,
                                  DateCreated = fi.DateCreated,
                                  UpdatedBy = fi.UpdatedBy,
                                  DateUpdated = fi.DateUpdated
                              }).ToListAsync();
            }
            catch (Exception ex)
            {
                throw new Exception(ex.Message, ex);
            }
            }

        public async Task<FertilizerInput?> GetByIdAsync(int id)
        {
            try
            {
                return await (from fi in _context.FertilizerInput
                              join ca in _context.Catalog on fi.CatalogId equals ca.Id
                              join f in _context.Fertilizer on fi.FertilizerId equals f.Id
                              where (
                                        (ca.ClientId == GetSessionClientId() && GetSessionProfileId() == (int)Profiles.CompanyUser) ||
                                        (ca.ClientId == GetSessionClientId() && GetSessionProfileId() == (int)Profiles.ClientAdmin) ||
                                        (GetSessionProfileId() == (int)Profiles.SuperUser)
                                    )
                                    && (fi.Id == id)
                              select new FertilizerInput
                              {
                                  Id = fi.Id,
                                  CatalogId = fi.CatalogId,
                                  InputPresentationId = fi.InputPresentationId,
                                  FertilizerId = fi.FertilizerId,
                                  Name = fi.Name,
                                  Price = fi.Price,
                                  Active = fi.Active,
                                  CreatedBy = fi.CreatedBy,
                                  DateCreated = fi.DateCreated,
                                  UpdatedBy = fi.UpdatedBy,
                                  DateUpdated = fi.DateUpdated
                              }).FirstOrDefaultAsync();
            }
            catch (Exception ex)
            {
                    throw new Exception(ex.Message, ex);
            }
        }
    }
}
