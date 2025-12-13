using AgriSmart.Core.Entities;
using AgriSmart.Core.Repositories.Commands;
using AgriSmart.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace AgriSmart.Infrastructure.Repositories.Command
{
    public class CropProductionSpecsCommandRepository : ICropProductionSpecsCommandRepository
    {
        private readonly AgriSmartContext _context;

        public CropProductionSpecsCommandRepository(AgriSmartContext context)
        {
            _context = context;
        }

        public async Task<CropProductionSpecs> CreateAsync(CropProductionSpecs entity)
        {
            entity.DateCreated = DateTime.UtcNow;
            entity.Active = true;

            await _context.CropProductionSpecs.AddAsync(entity);
            await _context.SaveChangesAsync();

            return entity;
        }

        public async Task<CropProductionSpecs> UpdateAsync(CropProductionSpecs entity)
        {
            entity.DateUpdated = DateTime.UtcNow;

            _context.CropProductionSpecs.Update(entity);
            await _context.SaveChangesAsync();

            return entity;
        }

        public async Task<bool> DeleteAsync(int id, int deletedBy)
        {
            var entity = await _context.CropProductionSpecs.FindAsync(id);
            if (entity == null)
                return false;

            // Soft delete
            entity.Active = false;
            entity.DateUpdated = DateTime.UtcNow;
            entity.UpdatedBy = deletedBy;

            _context.CropProductionSpecs.Update(entity);
            await _context.SaveChangesAsync();

            return true;
        }
    }
}
