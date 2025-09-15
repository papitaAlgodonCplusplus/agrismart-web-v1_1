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
    public class SensorQueryRepository : BaseQueryRepository<Sensor>, ISensorQueryRepository
    {
        protected readonly AgriSmartContext _context;
        public SensorQueryRepository(AgriSmartContext context, IOptions<AgriSmartDbConfiguration> dbConfiguration, IHttpContextAccessor httpContextAccessor) : base(dbConfiguration, httpContextAccessor)
        {
            _context = context;
        }

        public async Task<IReadOnlyList<Sensor>> GetAllAsync(int companyId, int deviceId, bool includeInactives = false)
        {
            try
            {
                return await (from s in _context.Sensor
                              join d in _context.Device on s.DeviceId equals d.Id
                              join c in _context.Company on d.CompanyId equals c.Id                              
                              where
                                  (
                                        (c.ClientId == GetSessionClientId() && GetSessionProfileId() == (int)Profiles.CompanyUser) ||
                                        (c.ClientId == GetSessionClientId() && GetSessionProfileId() == (int)Profiles.ClientAdmin) ||
                                        (GetSessionProfileId() == (int)Profiles.SuperUser)                                    
                                  )
                                  && ((d.CompanyId == companyId) || companyId == 0)
                                  && ((s.DeviceId == deviceId) || deviceId == 0)
                                  && ((s.Active && !includeInactives) || includeInactives)
                              select new Sensor
                              {
                                  Id = s.Id,
                                  DeviceId = s.DeviceId,
                                  SensorLabel = s.SensorLabel,
                                  Description = s.Description,
                                  MeasurementVariableId = s.MeasurementVariableId,
                                  NumberOfContainers = s.NumberOfContainers,
                                  Active = s.Active,
                                  DateCreated = s.DateCreated,
                                  DateUpdated = s.DateUpdated,
                                  CreatedBy = s.CreatedBy,
                                  UpdatedBy = s.UpdatedBy
                              }).ToListAsync();
            }
            catch (Exception ex)
            {
                throw new Exception(ex.Message, ex);
            }
        }

        public async Task<IReadOnlyList<Sensor>> GetAllAsync(bool includeInactives = false)
        {
            try
            {
                return await (from s in _context.Sensor.Where(x => x.Active == includeInactives || includeInactives)
                              select s).ToListAsync();
            }
            catch (Exception ex)
            {
                throw new Exception(ex.Message, ex);
            }
        }

        public async Task<Sensor?> GetByIdAsync(int id)
        {
            try
            {
                return await (from s in _context.Sensor
                              join d in _context.Device on s.DeviceId equals d.Id
                              join c in _context.Company on d.CompanyId equals c.Id
                              where
                                  (
                                        (c.ClientId == GetSessionClientId() && GetSessionProfileId() == (int)Profiles.CompanyUser) ||
                                        (c.ClientId == GetSessionClientId() && GetSessionProfileId() == (int)Profiles.ClientAdmin) ||
                                        (GetSessionProfileId() == (int)Profiles.SuperUser)
                                  )
                                  && (s.Id == id)
                              select new Sensor
                              {
                                  Id = s.Id,
                                  DeviceId = s.DeviceId,
                                  SensorLabel = s.SensorLabel,
                                  Description = s.Description,
                                  Active = s.Active,
                                  DateCreated = s.DateCreated,
                                  DateUpdated = s.DateUpdated,
                                  CreatedBy = s.CreatedBy,
                                  UpdatedBy = s.UpdatedBy
                              }).FirstOrDefaultAsync();
            }
            catch (Exception ex)
            {
                throw new Exception(ex.Message, ex);
            }
        }
    }
}
