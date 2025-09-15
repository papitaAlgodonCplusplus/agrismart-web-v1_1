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


        public async Task<CropPhaseSolutionRequirement?> GetByIdPhaseAsync(int phaseId, bool includeInactives)
        {
            try
            {
                return await _context.CropPhaseSolutionRequirement
                    .Where(record => record.PhaseId == phaseId && record.Active != includeInactives)
                    .AsNoTracking().FirstOrDefaultAsync();
            }
            catch (Exception ex)
            {
                throw new Exception(ex.Message, ex);
            }
        }
    }
}
