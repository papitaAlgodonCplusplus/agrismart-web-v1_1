using AgriSmart.Core.Configuration;
using AgriSmart.Infrastructure.Data;
using AgriSmart.Core.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Options;
using System.Data;
using AgriSmart.Core.Repositories.Queries;
using Microsoft.AspNetCore.Http;
using AgriSmart.Application.Agronomic.Resources;
using System.Security.Cryptography.X509Certificates;

namespace AgriSmart.Infrastructure.Repositories.Query
{
    public class IrrigationRequestsQueryRepository : BaseQueryRepository<IrrigationRequestsQueryRepository>, IIrrigationRequestsQueryRepository
    {
        protected readonly AgriSmartContext _context;
        public IrrigationRequestsQueryRepository(AgriSmartContext context, IOptions<AgriSmartDbConfiguration> dbConfiguration, IHttpContextAccessor httpContextAccessor) : base(dbConfiguration, httpContextAccessor)
        {
            _context = context;
        }

        public async Task<IReadOnlyList<IrrigationRequest>> GetAllAsync(int clientId = 0, int companyId = 0, int farmId = 0, int productionUnitId = 0)
        {
            try
            {
                return await (from ir in _context.CropProductionIrrigationRequest
                              join cp in _context.CropProduction on ir.CropProductionId equals cp.Id
                              join pu in _context.ProductionUnit on cp.ProductionUnitId equals pu.Id
                              join fa in _context.Farm on pu.FarmId equals fa.Id
                              join c in _context.Company on fa.CompanyId equals c.Id
                              join uf in _context.UserFarm on fa.Id equals uf.FarmId into userFarms
                              from juf in userFarms.DefaultIfEmpty()
                              where
                                 (
                                     (juf.UserId == GetSessionUserId() && GetSessionProfileId() == (int)Profiles.CompanyUser) ||
                                     (c.ClientId == GetSessionClientId() && GetSessionProfileId() == (int)Profiles.ClientAdmin) ||
                                     (GetSessionProfileId() == (int)Profiles.SuperUser)
                                 )
                                  && ((c.ClientId == clientId) || clientId == 0)
                                  && ((fa.CompanyId == companyId) || companyId == 0)
                                  && ((fa.Id == farmId) || farmId == 0)
                                  && ((pu.Id == productionUnitId) || productionUnitId == 0)
                              group ir by ir.Id into fg
                              select new IrrigationRequest
                              {
                                  Id = fg.Key,
                                  CropProductionId = fg.FirstOrDefault().CropProductionId,
                                  Irrigate = fg.FirstOrDefault().Irrigate,
                                  IrrigationTime = fg.FirstOrDefault().IrrigationTime,
                                  DateStarted = fg.FirstOrDefault().DateStarted,
                                  DateEnded = fg.FirstOrDefault().DateEnded
                              })
             .ToListAsync();                
            }
            catch (Exception ex)
            {
                throw new Exception(ex.Message, ex);
            }
        }
    }
}
