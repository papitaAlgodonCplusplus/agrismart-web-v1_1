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
    public class DeviceQueryRepository : BaseQueryRepository<Device>, IDeviceQueryRepository
    {
        protected readonly AgriSmartContext _context;
        public DeviceQueryRepository(AgriSmartContext context, IOptions<AgriSmartDbConfiguration> dbConfiguration, IHttpContextAccessor httpContextAccessor) : base(dbConfiguration, httpContextAccessor)
        {
            _context = context;
        }

        public async Task<Device?> AuthenticateAsync(string? deviceId, string? devicePassword)
        {
            try
            {
                return await _context.Device
                    .Select(record => new Device()
                    {
                        Id = record.Id,
                        CompanyId = record.CompanyId,
                        DeviceId = record.DeviceId,
                        Active = record.Active,
                        DateCreated = record.DateCreated,
                        DateUpdated = record.DateUpdated,
                        CreatedBy = record.CreatedBy,
                        UpdatedBy = record.UpdatedBy
                    })
                    .Where(record => (record.DeviceId == deviceId && deviceId != null)                       
                        && record.Active)
                    .AsNoTracking()
                    .FirstOrDefaultAsync();
            }
            catch (Exception ex)
            {
                throw new Exception(ex.Message, ex);
            }
        }

        public async Task<Device?> AuthenticateMqttClientAsync(string? connectUsername, string? connectPassword)
        {
            try
            {
                return await _context.Device
                    .Select(record => new Device()
                    {
                        Id = record.Id,
                        CompanyId = record.CompanyId,
                        DeviceId = record.DeviceId,
                        Active = record.Active,
                        DateCreated = record.DateCreated,
                        DateUpdated = record.DateUpdated,
                        CreatedBy = record.CreatedBy,
                        UpdatedBy = record.UpdatedBy
                    })
                    .Where(record => record.Active)
                    .AsNoTracking()
                    .FirstOrDefaultAsync();
            }
            catch (Exception ex)
            {
                throw new Exception(ex.Message, ex);
            }
        }

        public async Task<IReadOnlyList<Device>> GetAllAsync(int clientId = 0, int companyId = 0, int cropProductionId = 0, bool includeInactives = false)
        {
            try
            {

                return await (from d in _context.Device
                              join cpd in _context.CropProductionDevice on d.Id equals cpd.DeviceId
                              join cp in _context.CropProduction on cpd.CropProductionId equals cp.Id
                              join pu in _context.ProductionUnit on cp.ProductionUnitId equals pu.Id
                              join f in _context.Farm on pu.FarmId equals f.Id
                              join c in _context.Company on f.CompanyId equals c.Id
                              join uf in _context.UserFarm on f.Id equals uf.FarmId
                              where
                                  (uf.UserId == GetSessionUserId() && GetSessionProfileId() == (int)Profiles.CompanyUser)
                                  && ((cp.Id == cropProductionId) || cropProductionId == 0)
                                  && ((d.Active && !includeInactives) || includeInactives)
                              select d)
                              .Union(from d in _context.Device
                                     join c in _context.Company on d.CompanyId equals c.Id
                                     where (
                                        (c.ClientId == GetSessionClientId() && GetSessionProfileId() == (int)Profiles.ClientAdmin) ||
                                        (GetSessionProfileId() == (int)Profiles.SuperUser)
                                    )                                    
                                    && ((c.ClientId == clientId) || clientId == 0)
                                    && ((c.Id == companyId) || companyId == 0)
                                    && (cropProductionId == 0)
                                    && ((d.Active && !includeInactives) || includeInactives)
                                    select d)
                               .Union(from d in _context.Device
                                      join c in _context.Company on d.CompanyId equals c.Id
                                      join f in _context.Farm on c.Id equals f.CompanyId
                                      join pu in _context.ProductionUnit on f.Id equals pu.FarmId
                                      join cp in _context.CropProduction on pu.Id equals cp.ProductionUnitId
                                      where (
                                         (c.ClientId == GetSessionClientId() && GetSessionProfileId() == (int)Profiles.ClientAdmin) ||
                                         (GetSessionProfileId() == (int)Profiles.SuperUser)
                                     )
                                     && ((c.ClientId == clientId) || clientId == 0)
                                     && ((c.Id == companyId) || companyId == 0)
                                     && (cp.Id == cropProductionId)
                                     && ((d.Active && !includeInactives) || includeInactives)
                                      select d)
                              .ToListAsync();
            }
            catch (Exception ex)
            {
                throw new Exception(ex.Message, ex);
            }
        }

        public async Task<IReadOnlyList<Device>> GetAllAsync(bool includeInactives = false)
        {
            try
            {
                return await (from d in _context.Device.Where(x => x.Active == includeInactives || includeInactives)
                              select d).ToListAsync();
            }
            catch (Exception ex)
            {
                throw new Exception(ex.Message, ex);
            }
        }

        public async Task<Device?> GetByIdAsync(int id)
        {
            try
            {
                return await (from d in _context.Device
                              where (
                                        (GetSessionProfileId() == (int)Profiles.CompanyUser) ||
                                        (GetSessionProfileId() == (int)Profiles.ClientAdmin) ||
                                        (GetSessionProfileId() == (int)Profiles.SuperUser)
                                    )
                                     && (d.Id == id)
                              select d).FirstOrDefaultAsync();
            }
            catch (Exception ex)
            {
                throw new Exception(ex.Message, ex);
            }
        }        
    }
}
