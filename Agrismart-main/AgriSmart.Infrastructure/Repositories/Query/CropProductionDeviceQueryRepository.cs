using AgriSmart.Core.Configuration;
using AgriSmart.Infrastructure.Data;
using AgriSmart.Core.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Options;
using System.Data;
using AgriSmart.Core.Repositories.Queries;
using Microsoft.AspNetCore.Http;
using AgriSmart.Core.Enums;
using AutoMapper;


namespace AgriSmart.Infrastructure.Repositories.Query
{
    public class CropProductionDeviceQueryRepository : BaseQueryRepository<CropProductionDevice>, ICropProductionDeviceQueryRepository
    {
        protected readonly AgriSmartContext _context;
        public CropProductionDeviceQueryRepository(AgriSmartContext context, IOptions<AgriSmartDbConfiguration> dbConfiguration, IHttpContextAccessor httpContextAccessor) : base(dbConfiguration, httpContextAccessor)
        {
            _context = context;
        }

        public async Task<IReadOnlyList<CropProductionDevice>> GetAllAsync(int cropProductionId = 0)
        {
            try
            {
                if (GetSessionProfileId() == (int)Profiles.SuperUser)
                {
                    return await (from cpd in _context.CropProductionDevice
                                  join cp in _context.CropProduction on cpd.CropProductionId equals cp.Id
                                  join pu in _context.ProductionUnit on cp.ProductionUnitId equals pu.Id
                                  join f in _context.Farm on pu.FarmId equals f.Id
                                  join c in _context.Company on f.CompanyId equals c.Id                                  
                                  where
                                      (
                                          (c.ClientId == GetSessionClientId() && GetSessionProfileId() == (int)Profiles.ClientAdmin) ||
                                          (GetSessionProfileId() == (int)Profiles.SuperUser)
                                      )
                                      && ((cpd.CropProductionId == cropProductionId) || cropProductionId == 0)
                                  select cpd).ToListAsync();
                }
                else
                {

                    return await (from cpd in _context.CropProductionDevice
                                  join cp in _context.CropProduction on cpd.CropProductionId equals cp.Id
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
                                      && ((cpd.CropProductionId == cropProductionId) || cropProductionId == 0)
                                  select cpd).ToListAsync();
                }
            }
            catch (Exception ex)
            {
                throw new Exception(ex.Message, ex);
            }
        }

    }
}
