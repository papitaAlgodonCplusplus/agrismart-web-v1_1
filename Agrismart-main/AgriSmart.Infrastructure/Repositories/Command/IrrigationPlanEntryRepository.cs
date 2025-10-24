using AgriSmart.Core.Entities;
using AgriSmart.Core.Repositories.Commands;
using AgriSmart.Core.Repositories.Queries;
using AgriSmart.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace AgriSmart.Infrastructure.Repositories
{
    public class IrrigationPlanEntryCommandRepository : IIrrigationPlanEntryCommandRepository
    {
        private readonly AgriSmartContext _context;

        public IrrigationPlanEntryCommandRepository(AgriSmartContext context)
        {
            _context = context;
        }

        public async Task<IrrigationPlanEntry> AddAsync(IrrigationPlanEntry irrigationPlanEntry)
        {
            _context.IrrigationPlanEntries.Add(irrigationPlanEntry);
            await _context.SaveChangesAsync();
            return irrigationPlanEntry;
        }

        public async Task<IrrigationPlanEntry> UpdateAsync(IrrigationPlanEntry irrigationPlanEntry)
        {
            _context.IrrigationPlanEntries.Update(irrigationPlanEntry);
            await _context.SaveChangesAsync();
            return irrigationPlanEntry;
        }

        public async Task DeleteAsync(IrrigationPlanEntry irrigationPlanEntry)
        {
            _context.IrrigationPlanEntries.Remove(irrigationPlanEntry);
            await _context.SaveChangesAsync();
        }

        public int GetSessionUserId()
        {
            return 1;
        }
    }

    public class IrrigationPlanEntryQueryRepository : IIrrigationPlanEntryQueryRepository
    {
        private readonly AgriSmartContext _context;

        public IrrigationPlanEntryQueryRepository(AgriSmartContext context)
        {
            _context = context;
        }

        public async Task<List<IrrigationPlanEntry>> GetAllAsync()
        {
            return await _context.IrrigationPlanEntries
                .Include(x => x.IrrigationPlan)
                .Include(x => x.IrrigationMode)
                .Where(x => x.Active)
                .OrderBy(x => x.IrrigationPlanId)
                .ThenBy(x => x.Sequence)
                .ToListAsync();
        }

        public async Task<IrrigationPlanEntry> GetByIdAsync(int id)
        {
            return await _context.IrrigationPlanEntries
                .Include(x => x.IrrigationPlan)
                .Include(x => x.IrrigationMode)
                .FirstOrDefaultAsync(x => x.Id == id);
        }

        public async Task<List<IrrigationPlanEntry>> GetByIrrigationPlanIdAsync(int irrigationPlanId)
        {
            return await _context.IrrigationPlanEntries
                .Include(x => x.IrrigationMode)
                .Where(x => x.IrrigationPlanId == irrigationPlanId && x.Active)
                .OrderBy(x => x.Sequence)
                .ToListAsync();
        }

        public async Task<List<IrrigationPlanEntry>> GetByIrrigationModeIdAsync(int irrigationModeId)
        {
            return await _context.IrrigationPlanEntries
                .Include(x => x.IrrigationPlan)
                .Where(x => x.IrrigationModeId == irrigationModeId && x.Active)
                .OrderBy(x => x.IrrigationPlanId)
                .ThenBy(x => x.Sequence)
                .ToListAsync();
        }
    }
}