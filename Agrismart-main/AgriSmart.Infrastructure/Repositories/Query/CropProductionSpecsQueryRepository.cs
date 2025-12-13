using AgriSmart.Core.Entities;
using AgriSmart.Core.Repositories.Query;
using AgriSmart.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace AgriSmart.Infrastructure.Repositories.Query
{
    public class CropProductionSpecsQueryRepository : ICropProductionSpecsQueryRepository
    {
        private readonly AgriSmartContext _context;

        public CropProductionSpecsQueryRepository(AgriSmartContext context)
        {
            _context = context;
        }

        public async Task<IReadOnlyList<CropProductionSpecs>> GetAllAsync(bool includeInactives = false)
        {
            var query = _context.CropProductionSpecs.AsQueryable();

            if (!includeInactives)
            {
                query = query.Where(x => x.Active);
            }

            return await query
                .OrderByDescending(x => x.DateCreated)
                .ToListAsync();
        }

        public async Task<CropProductionSpecs?> GetByIdAsync(int id)
        {
            return await _context.CropProductionSpecs
                .FirstOrDefaultAsync(x => x.Id == id);
        }
    }
}
