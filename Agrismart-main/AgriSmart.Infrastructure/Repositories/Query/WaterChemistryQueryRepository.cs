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
    public class WaterChemistryQueryRepository : BaseQueryRepository<Water>, IWaterChemistryQueryRepository
    {
        protected readonly AgriSmartContext _context;
        public WaterChemistryQueryRepository(AgriSmartContext context, IOptions<AgriSmartDbConfiguration> dbConfiguration, IHttpContextAccessor httpContextAccessor) : base(dbConfiguration, httpContextAccessor)
        {
            _context = context;
        }

        public async Task<IReadOnlyList<WaterChemistry>> GetAllAsync(int waterId = 0, int catalogId = 0, bool includeInactives = false)
        {
            try
            {
                return await (from wc in _context.WaterChemistry
                              join w in _context.Water on wc.WaterId equals w.Id
                              join ca in _context.Catalog on w.CatalogId equals ca.Id
                              where (
                                        (ca.ClientId == GetSessionClientId() && GetSessionProfileId() == (int)Profiles.CompanyUser) ||
                                        (ca.ClientId == GetSessionClientId() && GetSessionProfileId() == (int)Profiles.ClientAdmin) ||
                                        (GetSessionProfileId() == (int)Profiles.SuperUser)
                                    )
                                    && ((ca.Id == catalogId) || catalogId == 0)
                                    && ((w.Id == waterId) || waterId == 0)
                                    && ((w.Active && !includeInactives) || includeInactives)
                              select new WaterChemistry
                              {
                                  Id = wc.Id,
                                  WaterId = wc.WaterId,
                                  Ca = wc.Ca,
                                  K = wc.K,
                                  Mg = wc.Mg,
                                  Na = wc.Na,
                                  NH4 = wc.NH4,
                                  Fe = wc.Fe,
                                  Cu = wc.Cu,
                                  Mn = wc.Mn,
                                  Zn = wc.Zn,
                                  NO3 = wc.NO3,
                                  SO4 = wc.SO4,
                                  Cl = wc.Cl,
                                  B = wc.B,
                                  H2PO4 = wc.H2PO4,
                                  HCO3 = wc.HCO3,
                                  BO4 = wc.BO4,
                                  MOO4 = wc.MOO4,
                                  EC = wc.EC,
                                  pH = wc.pH,
                                  AnalysisDate = wc.AnalysisDate,
                                  Active = wc.Active,
                                  CreatedBy = wc.CreatedBy,
                                  DateCreated = wc.DateCreated,
                                  UpdatedBy = wc.UpdatedBy,
                                  DateUpdated = wc.DateUpdated

                              }).ToListAsync();                 
            }
            catch (Exception ex)
            {
                throw new Exception(ex.Message, ex);
            }
        }

        public async Task<WaterChemistry> GetByIdAsync(int id)
        {
            try
            {
                return await (from wc in _context.WaterChemistry
                              join w in _context.Water on wc.WaterId equals w.Id
                              join ca in _context.Catalog on w.CatalogId equals ca.Id
                              where (
                                        (ca.ClientId == GetSessionClientId() && GetSessionProfileId() == (int)Profiles.CompanyUser) ||
                                        (ca.ClientId == GetSessionClientId() && GetSessionProfileId() == (int)Profiles.ClientAdmin) ||
                                        (GetSessionProfileId() == (int)Profiles.SuperUser)
                                    )
                                    && (wc.Id == id)
                              select new WaterChemistry
                              {
                                  Id = wc.Id,
                                  WaterId = wc.WaterId,
                                  Ca = wc.Ca,
                                  K = wc.K,
                                  Mg = wc.Mg,
                                  Na = wc.Na,
                                  NH4 = wc.NH4,
                                  Fe = wc.Fe,
                                  Cu = wc.Cu,
                                  Mn = wc.Mn,
                                  Zn = wc.Zn,
                                  NO3 = wc.NO3,
                                  SO4 = wc.SO4,
                                  Cl = wc.Cl,
                                  B = wc.B,
                                  H2PO4 = wc.H2PO4,
                                  HCO3 = wc.HCO3,
                                  BO4 = wc.BO4,
                                  MOO4 = wc.MOO4,
                                  EC = wc.EC,
                                  pH = wc.pH,
                                  AnalysisDate = wc.AnalysisDate,
                                  DateCreated = wc.DateCreated,
                                  DateUpdated = wc.DateUpdated,
                                  CreatedBy = wc.CreatedBy,
                                  UpdatedBy = wc.UpdatedBy
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