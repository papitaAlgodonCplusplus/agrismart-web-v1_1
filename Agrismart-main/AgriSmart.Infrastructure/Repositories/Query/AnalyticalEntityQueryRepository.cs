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
    public class AnalyticalEntityQueryRepository : BaseQueryRepository<AnalyticalEntity>, IAnalyticalEntityQueryRepository
    {
        protected readonly AgriSmartContext _context;
        public AnalyticalEntityQueryRepository(AgriSmartContext context, IOptions<AgriSmartDbConfiguration> dbConfiguration, IHttpContextAccessor httpContextAccessor) : base(dbConfiguration, httpContextAccessor)
        {
            _context = context;
        }

        public async Task<IReadOnlyList<AnalyticalEntity>> GetAllAsync(int catalogId = 0, bool includeInactives = false)
        {
            try
            {
                return await (from gr in _context.AnaliticalEntity
                              join ca in _context.Catalog on gr.CatalogId equals ca.Id
                              where (
                                        (ca.ClientId == GetSessionClientId() && GetSessionProfileId() == (int)Profiles.CompanyUser) ||
                                        (ca.ClientId == GetSessionClientId() && GetSessionProfileId() == (int)Profiles.ClientAdmin) ||
                                        (GetSessionProfileId() == (int)Profiles.SuperUser)
                                    )
                                    && ((ca.Id == catalogId) || catalogId == 0)
                                    && ((gr.Active && !includeInactives) || includeInactives)
                              select new AnalyticalEntity
                              {
                                  Id = gr.Id,
                                  CatalogId = gr.CatalogId,
                                  Name = gr.Name,
                                  Description = gr.Description,
                                  Script = gr.Script,
                                  EntityType = gr.EntityType,
                                  Active = gr.Active,
                                  CreatedBy = gr.CreatedBy,
                                  DateCreated = gr.DateCreated,
                                  UpdatedBy = gr.UpdatedBy,
                                  DateUpdated = gr.DateUpdated
                              }).ToListAsync();
            }
            catch (Exception ex)
            {
                throw new Exception(ex.Message, ex);
            }
            }

        public async Task<AnalyticalEntity?> GetByIdAsync(int id)
        {
            try
            {
                return await (from gr in _context.AnaliticalEntity
                              join ca in _context.Catalog on gr.CatalogId equals ca.Id
                              where (
                                        (ca.ClientId == GetSessionClientId() && GetSessionProfileId() == (int)Profiles.CompanyUser) ||
                                        (ca.ClientId == GetSessionClientId() && GetSessionProfileId() == (int)Profiles.ClientAdmin) ||
                                        (GetSessionProfileId() == (int)Profiles.SuperUser)
                                    )
                                    && (gr.Id == id)
                              select new AnalyticalEntity
                              {
                                  Id = gr.Id,
                                  CatalogId = gr.CatalogId,
                                  Name = gr.Name,
                                  Description = gr.Description,
                                  Script = gr.Script,
                                  EntityType = gr.EntityType,
                                  Active = gr.Active,
                                  CreatedBy = gr.CreatedBy,
                                  DateCreated = gr.DateCreated,
                                  UpdatedBy = gr.UpdatedBy,
                                  DateUpdated = gr.DateUpdated
                              }).FirstOrDefaultAsync();
            }
            catch (Exception ex)
            {
                    throw new Exception(ex.Message, ex);
            }
        }
    }
}
