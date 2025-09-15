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
    public class MeasurementQueryRepository : BaseQueryRepository<Measurement>, IMeasurementQueryRepository
    {
        protected readonly AgriSmartContext _context;
        public MeasurementQueryRepository(AgriSmartContext context, IOptions<AgriSmartDbConfiguration> dbConfiguration, IHttpContextAccessor httpContextAccessor) : base(dbConfiguration, httpContextAccessor)
        {
            _context = context;
        }

        public async Task<IReadOnlyList<Measurement>> GetAllAsync(DateTime periodStartingDate, DateTime periodEndingDate, int cropProductionId = 0, int measurementVariableId = 0)
        {
            try
            {
                return await _context.Measurement
                    .Where(record => (record.CropProductionId == cropProductionId || cropProductionId == 0) &&
                        (record.MeasurementVariableId == measurementVariableId || measurementVariableId == 0) &&  
                        record.RecordDate >= periodStartingDate && record.RecordDate <= periodEndingDate)
                        .AsNoTracking()
                        .ToListAsync();

                //return await (from me in _context.Measurement
                //              join cp in _context.CropProduction on me.CropProductionId equals cp.Id
                //              join pu in _context.ProductionUnit on cp.ProductionUnitId equals pu.Id
                //              join f in _context.Farm on pu.FarmId equals f.Id
                //              join c in _context.Company on f.CompanyId equals c.Id
                //              join uf in _context.UserFarm on f.Id equals uf.FarmId into userFarms
                //              from userFarm in userFarms.DefaultIfEmpty()
                //              where
                //              (
                //                      (userFarm.UserId == GetSessionUserId() && GetSessionProfileId() == (int)Profiles.CompanyUser) ||
                //                      (c.ClientId == GetSessionClientId() && GetSessionProfileId() == (int)Profiles.ClientAdmin) ||
                //                      (GetSessionProfileId() == (int)Profiles.SuperUser)
                //               )

                //                    && ((me.CropProductionId == cropProductionId) || cropProductionId == 0)
                //                    && ((me.MeasurementVariableId == measurementVariableId) || measurementVariableId == 0)
                //                    && ((me.RecordDate >= periodStartingDate && me.RecordDate <= periodEndingDate))
                //              select new Measurement
                //              {
                //                  Id = me.Id,
                //                  RecordDate = me.RecordDate,
                //                  CropProductionId = me.CropProductionId,
                //                  MeasurementVariableId = me.MeasurementVariableId,
                //                  MinValue = me.MinValue,
                //                  MaxValue = me.MaxValue,
                //                  AvgValue = me.AvgValue,
                //                  SumValue = me.SumValue,
                //              }).ToListAsync();
            }
            catch (Exception ex)
            {
                throw new Exception(ex.Message, ex);
            }
        }

    }
}
