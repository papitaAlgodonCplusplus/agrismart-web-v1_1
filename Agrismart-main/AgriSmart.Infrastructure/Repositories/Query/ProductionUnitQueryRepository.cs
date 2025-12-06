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
    public class ProductionUnitQueryRepository : BaseQueryRepository<ProductionUnit>, IProductionUnitQueryRepository
    {
        protected readonly AgriSmartContext _context;
        public ProductionUnitQueryRepository(AgriSmartContext context, IOptions<AgriSmartDbConfiguration> dbConfiguration, IHttpContextAccessor httpContextAccessor) : base(dbConfiguration, httpContextAccessor)
        {
            _context = context;
        }

        public async Task<IReadOnlyList<ProductionUnit>> GetAllAsync(int companyId = 0, int farmId = 0, bool includeInactives = false)
        {
            try
            {
                return await (from pu in _context.ProductionUnit
                              join f in _context.Farm on pu.FarmId equals f.Id
                              join c in _context.Company on f.CompanyId equals c.Id
                              join uf in _context.UserFarm on f.Id equals uf.FarmId into userFarms
                              from userFarm in userFarms.DefaultIfEmpty()
                              where
                                  (
                                      (userFarm.UserId == GetSessionUserId() && GetSessionProfileId() == (int)Profiles.CompanyUser) ||
                                      (c.ClientId == GetSessionClientId() && GetSessionProfileId() == (int)Profiles.ClientAdmin) ||
                                      (GetSessionProfileId() == (int)Profiles.SuperUser)
                                  )
                                  && ((f.CompanyId == companyId) || companyId == 0)
                                  && ((f.Id == farmId) || farmId == 0)
                                  && (((pu.Active == true) && !includeInactives) || includeInactives)
                              group pu by pu.Id into pug
                              select new ProductionUnit
                              {
                                  Id = pug.Key,
                                  ProductionUnitTypeId = pug.FirstOrDefault().ProductionUnitTypeId,
                                  FarmId = pug.FirstOrDefault().FarmId,
                                  Name = pug.FirstOrDefault().Name,
                                  Description = pug.FirstOrDefault().Description,
                                  Location = pug.FirstOrDefault().Location,
                                  Area = pug.FirstOrDefault().Area,
                                  Capacity = pug.FirstOrDefault().Capacity,
                                  SoilType = pug.FirstOrDefault().SoilType,
                                  Drainage = pug.FirstOrDefault().Drainage,
                                  GreenhouseType = pug.FirstOrDefault().GreenhouseType,
                                  Ventilation = pug.FirstOrDefault().Ventilation,
                                  LightingSystem = pug.FirstOrDefault().LightingSystem,
                                  Irrigation = pug.FirstOrDefault().Irrigation,
                                  ClimateControl = pug.FirstOrDefault().ClimateControl,
                                  Active = pug.FirstOrDefault().Active,
                                  CreatedBy = pug.FirstOrDefault().CreatedBy,
                                  DateCreated = pug.FirstOrDefault().DateCreated,
                                  UpdatedBy = pug.FirstOrDefault().UpdatedBy,
                                  DateUpdated = pug.FirstOrDefault().DateUpdated
                              })
                             .ToListAsync();
            }
            catch (Exception ex)
            {
                throw new Exception(ex.Message, ex);
            }
        }

        public async Task<ProductionUnit?> GetByIdAsync(long id)
        {
            try
            {
                return await (from pu in _context.ProductionUnit
                              join f in _context.Farm on pu.FarmId equals f.Id
                              join c in _context.Company on f.CompanyId equals c.Id
                              join uf in _context.UserFarm on f.Id equals uf.FarmId into userFarms
                              from userFarm in userFarms.DefaultIfEmpty()
                              where
                                  (
                                      (userFarm.UserId == GetSessionUserId() && GetSessionProfileId() == (int)Profiles.CompanyUser) ||
                                      (c.ClientId == GetSessionClientId() && GetSessionProfileId() == (int)Profiles.ClientAdmin) ||
                                      (GetSessionProfileId() == (int)Profiles.SuperUser)
                                  )
                                  && (pu.Id == id)
                              group pu by pu.Id into pug
                              select new ProductionUnit
                              {
                                  Id = pug.Key,
                                  ProductionUnitTypeId = pug.FirstOrDefault().ProductionUnitTypeId,
                                  FarmId = pug.FirstOrDefault().FarmId,
                                  Name = pug.FirstOrDefault().Name,
                                  Description = pug.FirstOrDefault().Description,
                                  Location = pug.FirstOrDefault().Location,
                                  Area = pug.FirstOrDefault().Area,
                                  Capacity = pug.FirstOrDefault().Capacity,
                                  SoilType = pug.FirstOrDefault().SoilType,
                                  Drainage = pug.FirstOrDefault().Drainage,
                                  GreenhouseType = pug.FirstOrDefault().GreenhouseType,
                                  Ventilation = pug.FirstOrDefault().Ventilation,
                                  LightingSystem = pug.FirstOrDefault().LightingSystem,
                                  Irrigation = pug.FirstOrDefault().Irrigation,
                                  ClimateControl = pug.FirstOrDefault().ClimateControl,
                                  Active = pug.FirstOrDefault().Active,
                                  CreatedBy = pug.FirstOrDefault().CreatedBy,
                                  DateCreated = pug.FirstOrDefault().DateCreated,
                                  UpdatedBy = pug.FirstOrDefault().UpdatedBy,
                                  DateUpdated = pug.FirstOrDefault().DateUpdated
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
