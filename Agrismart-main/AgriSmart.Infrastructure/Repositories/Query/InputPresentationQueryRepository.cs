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
    public class InputPresentationQueryRepository : BaseQueryRepository<InputPresentation>, IInputPresentationQueryRepository
    {
        protected readonly AgriSmartContext _context;
        public InputPresentationQueryRepository(AgriSmartContext context, IOptions<AgriSmartDbConfiguration> dbConfiguration, IHttpContextAccessor httpContextAccessor) : base(dbConfiguration, httpContextAccessor)
        {
            _context = context;
        }

        public async Task<IReadOnlyList<InputPresentation>> GetAllAsync(int CatalogId = 0, bool includeInactives = false)
        {
            try
            {
                return await _context.InputPresentation
                    .Where(record => (record.CatalogId == CatalogId || CatalogId == 0) &&
                    ((record.Active && !includeInactives) || includeInactives))
                    .AsNoTracking()
                    .ToListAsync();                    
            }
            catch (Exception ex)
            {
                throw new Exception(ex.Message, ex);
            }
        }

        public async Task<InputPresentation?> GetByIdAsync(int id)
        {
            try
            {
                return await (from ip in _context.InputPresentation
                              join ca in _context.Catalog on ip.CatalogId equals ca.Id
                              where (
                                        (ca.ClientId == GetSessionClientId() && GetSessionProfileId() == (int)Profiles.CompanyUser) ||
                                        (ca.ClientId == GetSessionClientId() && GetSessionProfileId() == (int)Profiles.ClientAdmin) ||
                                        (GetSessionProfileId() == (int)Profiles.SuperUser)
                                    )
                                    && (ip.Id == id)
                              select new InputPresentation
                              {
                                  Id = ip.Id,
                                  CatalogId = ip.CatalogId,
                                  Name = ip.Name,
                                  MeasurementUnitId = ip.MeasurementUnitId,
                                  Description = ip.Description,
                                  Quantity = ip.Quantity,
                                  Active = ip.Active,
                                  CreatedBy = ip.CreatedBy,
                                  DateCreated = ip.DateCreated,
                                  UpdatedBy = ip.UpdatedBy,
                                  DateUpdated = ip.DateUpdated
                              }).FirstOrDefaultAsync();
            }
            catch (Exception ex)
            {
                throw new Exception(ex.Message, ex);
            }
        }
    }
}
