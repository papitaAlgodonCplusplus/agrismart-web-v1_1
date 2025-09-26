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
    public class MeasurementVariablesQueryRepository : BaseQueryRepository<MeasurementVariable>, IMeasurementVariableQueryRepository
    {
        protected readonly AgriSmartContext _context;
        public MeasurementVariablesQueryRepository(AgriSmartContext context, IOptions<AgriSmartDbConfiguration> dbConfiguration, IHttpContextAccessor httpContextAccessor) : base(dbConfiguration, httpContextAccessor)
        {
            _context = context;
        }

        public async Task<IReadOnlyList<MeasurementVariable>> GetAllAsync(int catalogId = 0)
        {
            try
            {
                return await (from mv in _context.MeasurementVariable
                              join ca in _context.Catalog on mv.CatalogId equals ca.Id
                              where (
                                        (ca.ClientId == GetSessionClientId() && GetSessionProfileId() == (int)Profiles.CompanyUser) ||
                                        (ca.ClientId == GetSessionClientId() && GetSessionProfileId() == (int)Profiles.ClientAdmin) ||
                                        (GetSessionProfileId() == (int)Profiles.SuperUser)
                                    )
                                    && ((ca.Id == catalogId) || catalogId == 0)
                              select new MeasurementVariable
                              {
                                  Id = mv.Id,
                                  MeasurementVariableStandardId = mv.MeasurementVariableStandardId,
                                  CatalogId = mv.CatalogId,
                                  Name = mv.Name,
                                  MeasurementUnitId = mv.MeasurementUnitId,
                                  FactorToMeasurementVariableStandard = mv.FactorToMeasurementVariableStandard,
                                  Active = (mv.Active ?? false),
                                  CreatedBy = mv.CreatedBy,
                                  DateCreated = mv.DateCreated,
                                  UpdatedBy = mv.UpdatedBy,
                                  DateUpdated = mv.DateUpdated
                              }).ToListAsync();
            }
            catch (Exception ex)
            {
                throw new Exception(ex.Message, ex);
            }
        }

        public async Task<MeasurementVariable> GetByIdAsync(int id)
        {
            try
            {
                return await (from f in _context.MeasurementVariable
                              join ca in _context.Catalog on f.CatalogId equals ca.Id
                              where (
                                        (ca.ClientId == GetSessionClientId() && GetSessionProfileId() == (int)Profiles.CompanyUser) ||
                                        (ca.ClientId == GetSessionClientId() && GetSessionProfileId() == (int)Profiles.ClientAdmin) ||
                                        (GetSessionProfileId() == (int)Profiles.SuperUser)
                                    )
                                    && (f.Id == id)
                              select new MeasurementVariable
                              {
                                  Id = f.Id,
                                  CatalogId = f.CatalogId,
                                  Name = f.Name,
                                  MeasurementVariableStandardId = f.MeasurementVariableStandardId,
                                  MeasurementUnitId = f.MeasurementUnitId,
                                  FactorToMeasurementVariableStandard = f.FactorToMeasurementVariableStandard,
                                  Active = (f.Active ?? false),
                                  DateCreated = f.DateCreated,
                                  DateUpdated = f.DateUpdated,
                                  CreatedBy = f.CreatedBy,
                                  UpdatedBy = f.UpdatedBy
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
