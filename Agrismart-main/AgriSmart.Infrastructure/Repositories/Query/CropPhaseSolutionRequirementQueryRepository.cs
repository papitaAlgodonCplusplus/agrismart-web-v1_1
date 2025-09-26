using AgriSmart.Core.Configuration;
using AgriSmart.Infrastructure.Data;
using AgriSmart.Core.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Options;
using System.Data;
using AgriSmart.Core.Repositories.Queries;
using Microsoft.AspNetCore.Http;


namespace AgriSmart.Infrastructure.Repositories.Query
{
    public class CropPhaseSolutionRequirementQueryRepository : BaseQueryRepository<CropPhaseSolutionRequirement>, ICropPhaseSolutionRequirementQueryRepository
    {
        protected readonly AgriSmartContext _context;
        public CropPhaseSolutionRequirementQueryRepository(AgriSmartContext context, IOptions<AgriSmartDbConfiguration> dbConfiguration, IHttpContextAccessor httpContextAccessor) : base(dbConfiguration, httpContextAccessor)
        {
            _context = context;
        }


        public async Task<CropPhaseSolutionRequirement?> GetByIdAsync(int id)
        {
            try
            {
                return await _context.CropPhaseSolutionRequirement
                    .Where(record => record.Id == id)
                    .AsNoTracking().FirstOrDefaultAsync();
            }
            catch (Exception ex)
            {
                throw new Exception(ex.Message, ex);
            }
        }

        public async Task<CropPhaseSolutionRequirement?> GetByIdPhaseAsync(int phaseId, bool includeInactives)
        {
            try
            {
                return await _context.CropPhaseSolutionRequirement
                    .Where(record => record.PhaseId == phaseId && (includeInactives || (record.Active == true)))
                    .AsNoTracking().FirstOrDefaultAsync();
            }
            catch (Exception ex)
            {
                throw new Exception(ex.Message, ex);
            }
        }

        public async Task<IReadOnlyList<CropPhaseSolutionRequirement>?> GetAllAsync(int? cropPhaseId, int? phaseId, bool includeInactives, bool includeValidatedOnly)
        {
            try
            {
                var query = _context.CropPhaseSolutionRequirement.AsQueryable();

                if (cropPhaseId.HasValue)
                    query = query.Where(record => record.CropPhaseId == cropPhaseId.Value);

                if (phaseId.HasValue)
                    query = query.Where(record => record.PhaseId == phaseId.Value);

                if (!includeInactives)
                    query = query.Where(record => record.Active == true);

                if (includeValidatedOnly)
                    query = query.Where(record => record.IsValidated);

                return await query.AsNoTracking().ToListAsync();
            }
            catch (Exception ex)
            {
                throw new Exception(ex.Message, ex);
            }
        }

        public async Task<IReadOnlyList<CropPhaseSolutionRequirement>?> GetByCropPhaseAsync(int cropPhaseId, bool includeInactives)
        {
            try
            {
                return await _context.CropPhaseSolutionRequirement
                    .Where(record => record.CropPhaseId == cropPhaseId && (includeInactives || (record.Active == true)))
                    .AsNoTracking().ToListAsync();
            }
            catch (Exception ex)
            {
                throw new Exception(ex.Message, ex);
            }
        }
    }
}
