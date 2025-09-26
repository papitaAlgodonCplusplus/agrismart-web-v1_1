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
    public class FertilizerChemistryQueryRepository : BaseQueryRepository<FertilizerChemistry>, IFertilizerChemistryQueryRepository
    {
        protected readonly AgriSmartContext _context;
        public FertilizerChemistryQueryRepository(AgriSmartContext context, IOptions<AgriSmartDbConfiguration> dbConfiguration, IHttpContextAccessor httpContextAccessor) : base(dbConfiguration, httpContextAccessor)
        {
            _context = context;
        }

        public async Task<IReadOnlyList<FertilizerChemistry>> GetAllAsync(int fertilizerId = 0, int catalogId = 0, bool includeInactives = false)
        {
            try
            {
                return await (from fc in _context.FertilizerChemistry
                              join f in _context.Fertilizer on fc.FertilizerId equals f.Id
                              join ca in _context.Catalog on f.CatalogId equals ca.Id
                              where (
                                        (ca.ClientId == GetSessionClientId() && GetSessionProfileId() == (int)Profiles.CompanyUser) ||
                                        (ca.ClientId == GetSessionClientId() && GetSessionProfileId() == (int)Profiles.ClientAdmin) ||
                                        (GetSessionProfileId() == (int)Profiles.SuperUser) ||
                                        (ca.Id == catalogId || catalogId == 0)
                                    )
                                    && ((f.Id == fertilizerId) || fertilizerId == 0)
                                    && ((f.Id == fertilizerId) || fertilizerId == 0)
                                    && (((fc.Active == true) && !includeInactives) || includeInactives)
                              select new FertilizerChemistry
                              {
                                  Id = fc.Id,
                                  FertilizerId = fc.FertilizerId,
                                  Purity = fc.Purity,
                                  Density = fc.Density,
                                  Solubility0 = fc.Solubility0,
                                  Solubility20 = fc.Solubility20,
                                  Solubility40 = fc.Solubility40,
                                  Formula = fc.Formula,
                                  Valence = fc.Valence,
                                  Active = (fc.Active ?? false),
                                  IsPhAdjuster = fc.IsPhAdjuster,
                                  CreatedBy = fc.CreatedBy,
                                  DateCreated = fc.DateCreated,
                                  UpdatedBy = fc.UpdatedBy,
                                  DateUpdated = fc.DateUpdated
                              }).ToListAsync();
            }
            catch (Exception ex)
            {
                throw new Exception(ex.Message, ex);
            }
        }

        public async Task<FertilizerChemistry?> GetByIdAsync(int id)
        {
            try
            {
                return await (from fc in _context.FertilizerChemistry
                              join f in _context.Fertilizer on fc.FertilizerId equals f.Id
                              join ca in _context.Catalog on f.CatalogId equals ca.Id
                              where (
                                        (ca.ClientId == GetSessionClientId() && GetSessionProfileId() == (int)Profiles.CompanyUser) ||
                                        (ca.ClientId == GetSessionClientId() && GetSessionProfileId() == (int)Profiles.ClientAdmin) ||
                                        (GetSessionProfileId() == (int)Profiles.SuperUser)
                                    )
                                    && (fc.Id == id)
                              select new FertilizerChemistry
                              {
                                  Id = f.Id,
                                  FertilizerId = fc.FertilizerId,
                                  Purity = fc.Purity,
                                  Density = fc.Density,
                                  Solubility0 = fc.Solubility0,
                                  Solubility20 = fc.Solubility20,
                                  Solubility40 = fc.Solubility40,
                                  Formula = fc.Formula,
                                  Active = (fc.Active ?? false),
                                  IsPhAdjuster = fc.IsPhAdjuster,
                                  CreatedBy = fc.CreatedBy,
                                  DateCreated = fc.DateCreated,
                                  UpdatedBy = fc.UpdatedBy,
                                  DateUpdated = fc.DateUpdated
                              }).FirstOrDefaultAsync();
            }
            catch (Exception ex)
            {
                throw new Exception(ex.Message, ex);
            }
        }
    }
}
