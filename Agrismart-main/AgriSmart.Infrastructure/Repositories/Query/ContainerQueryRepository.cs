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
    public class ContainerQueryRepository : BaseQueryRepository<Container>, IContainerQueryRepository
    {
        protected readonly AgriSmartContext _context;
        public ContainerQueryRepository(AgriSmartContext context, IOptions<AgriSmartDbConfiguration> dbConfiguration, IHttpContextAccessor httpContextAccessor) : base(dbConfiguration, httpContextAccessor)
        {
            _context = context;
        }

        public async Task<IReadOnlyList<Container>> GetAllAsync(int catalogId = 0, bool includeInactives = false)
        {
            try
            {
                return await (from c in _context.Container
                              join ca in _context.Catalog on c.CatalogId equals ca.Id
                              where (
                                        (ca.ClientId == GetSessionClientId() && GetSessionProfileId() == (int)Profiles.CompanyUser) ||
                                        (ca.ClientId == GetSessionClientId() && GetSessionProfileId() == (int)Profiles.ClientAdmin) ||
                                        (GetSessionProfileId() == (int)Profiles.SuperUser)
                                    )
                                    && ((ca.Id == catalogId) || catalogId == 0)
                                    && (((c.Active == true) && !includeInactives) || includeInactives)
                              select new Container
                              {
                                  Id = c.Id,
                                  CatalogId = c.CatalogId,
                                  Name = c.Name,
                                  ContainerTypeId = c.ContainerTypeId,
                                  Height = c.Height,
                                  Width = c.Width,
                                  Length = c.Length,
                                  LowerDiameter = c.LowerDiameter,
                                  UpperDiameter = c.UpperDiameter,
                                  Active = (c.Active ?? false),
                                  CreatedBy = c.CreatedBy,
                                  DateCreated = c.DateCreated,
                                  UpdatedBy = c.UpdatedBy,
                                  DateUpdated = c.DateUpdated
                              }).ToListAsync();
            }
            catch (Exception ex)
            {
                throw new Exception(ex.Message, ex);
            }
        }

        public async Task<Container?> GetByIdAsync(int id)
        {
            try
            {
                return await (from c in _context.Container
                              join ca in _context.Catalog on c.CatalogId equals ca.Id
                              where (
                                        (ca.ClientId == GetSessionClientId() && GetSessionProfileId() == (int)Profiles.CompanyUser) ||
                                        (ca.ClientId == GetSessionClientId() && GetSessionProfileId() == (int)Profiles.ClientAdmin) ||
                                        (GetSessionProfileId() == (int)Profiles.SuperUser)
                                    )
                                    && (c.Id == id)
                              select new Container
                              {
                                  Id = c.Id,
                                  CatalogId = c.CatalogId,
                                  Name = c.Name,
                                  ContainerTypeId = c.ContainerTypeId,
                                  Height = c.Height,
                                  Width = c.Width,
                                  Length = c.Length,
                                  LowerDiameter = c.LowerDiameter,
                                  UpperDiameter = c.UpperDiameter,
                                  Active = (c.Active ?? false),
                                  CreatedBy = c.CreatedBy,
                                  DateCreated = c.DateCreated,
                                  UpdatedBy = c.UpdatedBy,
                                  DateUpdated = c.DateUpdated
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
