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
    public class RelayModuleCropProductionIrrigationSectorQueryRepository : BaseQueryRepository<RelayModuleCropProductionIrrigationSector>, IRelayModuleCropProductionIrrigationSectorQueryRepository
    {
        protected readonly AgriSmartContext _context;
        public RelayModuleCropProductionIrrigationSectorQueryRepository(AgriSmartContext context, IOptions<AgriSmartDbConfiguration> dbConfiguration, IHttpContextAccessor httpContextAccessor) : base(dbConfiguration, httpContextAccessor)
        {
            _context = context;
        }

        /*public async Task<IReadOnlyList<RelayModuleCropProductionIrrigationSector>> GetAllAsync(int userId)
        {
           try
            {
                int a = GetSessionClientId();
                int b = GetSessionProfileId();

                var ab = await (from uf in _context.RelayModuleCropProductionIrrigationSector                                
                                join rm in _context.RelayModule on uf.RelayModuleId equals rm.Id
                                join cpis in _context.CropProductionIrrigationSector on uf.CropProductionIrrigationSectorId equals cpis.Id
                                where
    (
          (rm.ClientId == GetSessionClientId() && GetSessionProfileId() == (int)Profiles.CompanyUser && u.Id == GetSessionUserId()) ||
          (rm.ClientId == GetSessionClientId() && GetSessionProfileId() == (int)Profiles.ClientAdmin) ||
          (GetSessionProfileId() == (int)Profiles.SuperUser)
    ) && ((uf.UserId == userId) || userId == 0)
                                select uf).ToListAsync();

                return await (from uf in _context.RelayModuleCropProductionIrrigationSector
                              join u in _context.User on uf.UserId equals u.Id
                              where
                                  (
                                        (u.ClientId == GetSessionClientId() && GetSessionProfileId() == (int)Profiles.CompanyUser && u.Id == GetSessionUserId()) ||
                                        (u.ClientId == GetSessionClientId() && GetSessionProfileId() == (int)Profiles.ClientAdmin) ||
                                        (GetSessionProfileId() == (int)Profiles.SuperUser)
                                  )
                                  && ((uf.UserId == userId) || userId == 0)                              
                              select uf).ToListAsync();
            }
            catch (Exception ex)
            {
                throw new Exception(ex.Message, ex);
            }
        }*/
    }
}