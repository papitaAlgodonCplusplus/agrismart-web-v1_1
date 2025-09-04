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
    public class CropProductionQueryRepository : BaseQueryRepository<CropProduction>, ICropProductionQueryRepository
    {
        protected readonly AgriSmartContext _context;
        public CropProductionQueryRepository(AgriSmartContext context, IOptions<AgriSmartDbConfiguration> dbConfiguration, IHttpContextAccessor httpContextAccessor) : base(dbConfiguration, httpContextAccessor)
        {
            _context = context;
        }

        public async Task<IReadOnlyList<CropProduction>> GetAllAsync(int clientId = 0, int companyId = 0, int farmId = 0, int productionUnitId = 0, bool includeInactives = false)
        {
            try
            {
                return await (from cp in _context.CropProduction
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
                                  && ((c.ClientId == clientId) || clientId == 0)
                                  && ((f.CompanyId == companyId) || companyId == 0)
                                  && ((f.Id == farmId) || farmId == 0)
                                  && ((pu.Id == productionUnitId) || productionUnitId == 0)
                                  && ((cp.Active && !includeInactives) || includeInactives)
                              group cp by cp.Id into cpg
                              select new CropProduction
                              {
                                  Id = cpg.Key,
                                  CropId = cpg.FirstOrDefault().CropId,
                                  ProductionUnitId = cpg.FirstOrDefault().ProductionUnitId,
                                  Name = cpg.FirstOrDefault().Name,
                                  ContainerId = cpg.FirstOrDefault().ContainerId,
                                  GrowingMediumId = cpg.FirstOrDefault().GrowingMediumId,
                                  DropperId = cpg.FirstOrDefault().DropperId,
                                  Width = cpg.FirstOrDefault().Width,
                                  Length = cpg.FirstOrDefault().Length,
                                  BetweenRowDistance = cpg.FirstOrDefault().BetweenRowDistance,
                                  BetweenContainerDistance = cpg.FirstOrDefault().BetweenContainerDistance,
                                  BetweenPlantDistance = cpg.FirstOrDefault().BetweenPlantDistance,
                                  PlantsPerContainer = cpg.FirstOrDefault().PlantsPerContainer,
                                  NumberOfDroppersPerContainer = cpg.FirstOrDefault().NumberOfDroppersPerContainer,
                                  WindSpeedMeasurementHeight = cpg.FirstOrDefault().WindSpeedMeasurementHeight,
                                  StartDate = cpg.FirstOrDefault().StartDate,
                                  EndDate = cpg.FirstOrDefault().EndDate,
                                  Altitude = cpg.FirstOrDefault().Altitude,
                                  Latitude = cpg.FirstOrDefault().Latitude,
                                  Longitude = cpg.FirstOrDefault().Longitude,
                                  DepletionPercentage = cpg.FirstOrDefault().DepletionPercentage,
                                  DrainThreshold = cpg.FirstOrDefault().DrainThreshold,
                                  Active = cpg.FirstOrDefault().Active,
                                  CreatedBy = cpg.FirstOrDefault().CreatedBy,
                                  DateCreated = cpg.FirstOrDefault().DateCreated,
                                  UpdatedBy = cpg.FirstOrDefault().UpdatedBy,
                                  DateUpdated = cpg.FirstOrDefault().DateUpdated
                              })
                             .ToListAsync();
            }
            catch (Exception ex)
            {
                throw new Exception(ex.Message, ex);
            }
        }

        public async Task<CropProduction?> GetByIdAsync(long id)
        {
            try
            {
                return await (from cp in _context.CropProduction
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
                                  && (cp.Id == id)
                              group cp by cp.Id into cpg
                              select new CropProduction
                              {
                                  Id = cpg.Key,
                                  CropId = cpg.FirstOrDefault().CropId,
                                  ProductionUnitId = cpg.FirstOrDefault().ProductionUnitId,
                                  Name = cpg.FirstOrDefault().Name,
                                  ContainerId = cpg.FirstOrDefault().ContainerId,
                                  GrowingMediumId = cpg.FirstOrDefault().GrowingMediumId,
                                  Width = cpg.FirstOrDefault().Width,
                                  Length = cpg.FirstOrDefault().Length,
                                  BetweenRowDistance = cpg.FirstOrDefault().BetweenRowDistance,
                                  BetweenContainerDistance = cpg.FirstOrDefault().BetweenContainerDistance,
                                  BetweenPlantDistance = cpg.FirstOrDefault().BetweenPlantDistance,
                                  PlantsPerContainer = cpg.FirstOrDefault().PlantsPerContainer,
                                  StartDate = cpg.FirstOrDefault().StartDate,
                                  EndDate = cpg.FirstOrDefault().EndDate,
                                  WindSpeedMeasurementHeight = cpg.FirstOrDefault().WindSpeedMeasurementHeight,
                                  Altitude = cpg.FirstOrDefault().Altitude,
                                  Latitude = cpg.FirstOrDefault().Latitude,
                                  Longitude = cpg.FirstOrDefault().Longitude,
                                  Active = cpg.FirstOrDefault().Active,
                                  CreatedBy = cpg.FirstOrDefault().CreatedBy,
                                  DateCreated = cpg.FirstOrDefault().DateCreated,
                                  UpdatedBy = cpg.FirstOrDefault().UpdatedBy,
                                  DateUpdated = cpg.FirstOrDefault().DateUpdated
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
