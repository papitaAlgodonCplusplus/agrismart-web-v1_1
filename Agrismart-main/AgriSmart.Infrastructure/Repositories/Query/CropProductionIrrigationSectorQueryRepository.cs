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
    public class CropProductionIrrigationSectorQueryRepository : BaseQueryRepository<CropProductionIrrigationSector>, ICropProductionIrrigationSectorQueryRepository
    {
        protected readonly AgriSmartContext _context;
        public CropProductionIrrigationSectorQueryRepository(AgriSmartContext context, IOptions<AgriSmartDbConfiguration> dbConfiguration, IHttpContextAccessor httpContextAccessor) : base(dbConfiguration, httpContextAccessor)
        {
            _context = context;
        }

        public async Task<IReadOnlyList<CropProductionIrrigationSector>> GetAllAsync(int companyId = 0, int farmId = 0, int productionUnitId = 0, int cropProductionId = 0, bool includeInactives = false)
        {
            try
            {
                return await (from cpir in _context.CropProductionIrrigationSector
                              join cp in _context.CropProduction on cpir.CropProductionId equals cp.Id
                              join pu in _context.ProductionUnit on cp.ProductionUnitId equals pu.Id
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
                                  && ((pu.Id == productionUnitId) || productionUnitId == 0)
                                  && ((cp.Active && !includeInactives) || includeInactives)
                              group cpir by cpir.Id into cpirg
                              select new CropProductionIrrigationSector
                              {
                                  Id = cpirg.Key,
                                  CropProductionId = cpirg.FirstOrDefault().CropProductionId,
                                  Name = cpirg.FirstOrDefault().Name,
                                  Polygon = cpirg.FirstOrDefault().Polygon,
                                  Active = cpirg.FirstOrDefault().Active,
                                  CreatedBy = cpirg.FirstOrDefault().CreatedBy,
                                  DateCreated = cpirg.FirstOrDefault().DateCreated,
                                  UpdatedBy = cpirg.FirstOrDefault().UpdatedBy,
                                  DateUpdated = cpirg.FirstOrDefault().DateUpdated
                              })
                             .ToListAsync();
            }
            catch (Exception ex)
            {
                throw new Exception(ex.Message, ex);
            }
        }

        public async Task<CropProductionIrrigationSector?> GetByIdAsync(int id)
        {
            try
            {
                return await (from cpir in _context.CropProductionIrrigationSector
                              join cp in _context.CropProduction on cpir.CropProductionId equals cp.Id
                              join pu in _context.ProductionUnit on cp.ProductionUnitId equals pu.Id
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
                                  && (cpir.Id == id)
                              group cpir by cpir.Id into cpirg
                              select new CropProductionIrrigationSector
                              {
                                  Id = cpirg.Key,
                                  CropProductionId = cpirg.FirstOrDefault().CropProductionId,
                                  Name = cpirg.FirstOrDefault().Name,
                                  Polygon = cpirg.FirstOrDefault().Polygon,
                                  Active = cpirg.FirstOrDefault().Active,
                                  CreatedBy = cpirg.FirstOrDefault().CreatedBy,
                                  DateCreated = cpirg.FirstOrDefault().DateCreated,
                                  UpdatedBy = cpirg.FirstOrDefault().UpdatedBy,
                                  DateUpdated = cpirg.FirstOrDefault().DateUpdated
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
