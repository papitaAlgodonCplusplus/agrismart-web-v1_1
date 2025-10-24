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
    public class IrrigationPlanCommandRepository : IIrrigationPlanCommandRepository
    {
        private readonly AgriSmartContext _context;

        public IrrigationPlanCommandRepository(AgriSmartContext context)
        {
            _context = context;
        }

        public async Task<IrrigationPlan> AddAsync(IrrigationPlan irrigationPlan)
        {
            _context.IrrigationPlans.Add(irrigationPlan);
            await _context.SaveChangesAsync();
            return irrigationPlan;
        }

        public async Task<IrrigationPlan> UpdateAsync(IrrigationPlan irrigationPlan)
        {
            _context.IrrigationPlans.Update(irrigationPlan);
            await _context.SaveChangesAsync();
            return irrigationPlan;
        }

        public async Task DeleteAsync(IrrigationPlan irrigationPlan)
        {
            _context.IrrigationPlans.Remove(irrigationPlan);
            await _context.SaveChangesAsync();
        }

        public int GetSessionUserId()
        {
            // This would typically get the user ID from the HTTP context
            // For now, return a default value
            return 1;
        }
    }

    public class IrrigationPlanQueryRepository : IIrrigationPlanQueryRepository
    {
        private readonly AgriSmartContext _context;

        public IrrigationPlanQueryRepository(AgriSmartContext context)
        {
            _context = context;
        }

        public async Task<List<IrrigationPlan>> GetAllAsync()
        {
            return await _context.IrrigationPlans
                .Where(x => x.Active)
                .OrderBy(x => x.Name)
                .ToListAsync();
        }

        public async Task<IrrigationPlan> GetByIdAsync(int id)
        {
            return await _context.IrrigationPlans
                .FirstOrDefaultAsync(x => x.Id == id);
        }
    }
}