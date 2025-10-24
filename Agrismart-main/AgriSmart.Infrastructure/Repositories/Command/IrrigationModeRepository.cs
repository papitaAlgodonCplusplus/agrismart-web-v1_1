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
    public class IrrigationModeCommandRepository : IIrrigationModeCommandRepository
    {
        private readonly AgriSmartContext _context;

        public IrrigationModeCommandRepository(AgriSmartContext context)
        {
            _context = context;
        }

        public async Task<IrrigationMode> AddAsync(IrrigationMode irrigationMode)
        {
            _context.IrrigationModes.Add(irrigationMode);
            await _context.SaveChangesAsync();
            return irrigationMode;
        }

        public async Task<IrrigationMode> UpdateAsync(IrrigationMode irrigationMode)
        {
            _context.IrrigationModes.Update(irrigationMode);
            await _context.SaveChangesAsync();
            return irrigationMode;
        }

        public async Task DeleteAsync(IrrigationMode irrigationMode)
        {
            _context.IrrigationModes.Remove(irrigationMode);
            await _context.SaveChangesAsync();
        }

        public int GetSessionUserId()
        {
            return 1;
        }
    }

    public class IrrigationModeQueryRepository : IIrrigationModeQueryRepository
    {
        private readonly AgriSmartContext _context;

        public IrrigationModeQueryRepository(AgriSmartContext context)
        {
            _context = context;
        }

        public async Task<List<IrrigationMode>> GetAllAsync()
        {
            return await _context.IrrigationModes
                .Where(x => x.Active)
                .OrderBy(x => x.Name)
                .ToListAsync();
        }

        public async Task<IrrigationMode> GetByIdAsync(int id)
        {
            return await _context.IrrigationModes
                .FirstOrDefaultAsync(x => x.Id == id);
        }
    }
}