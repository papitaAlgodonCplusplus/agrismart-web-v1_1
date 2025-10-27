using AgriSmart.Core.Configuration;
using AgriSmart.Infrastructure.Data;
using AgriSmart.Core.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Options;
using AgriSmart.Core.Repositories.Queries;
using Microsoft.AspNetCore.Http;

namespace AgriSmart.Infrastructure.Repositories.Query
{
    public class IrrigationPlanEntryHistoryQueryRepository : BaseQueryRepository<IrrigationPlanEntryHistory>, IIrrigationPlanEntryHistoryQueryRepository
    {
        protected readonly AgriSmartContext _context;

        public IrrigationPlanEntryHistoryQueryRepository(AgriSmartContext context, IOptions<AgriSmartDbConfiguration> dbConfiguration, IHttpContextAccessor httpContextAccessor) : base(dbConfiguration, httpContextAccessor)
        {
            _context = context;
        }

        public async Task<List<IrrigationPlanEntryHistory>> GetAllAsync()
        {
            try
            {
                return await _context.IrrigationPlanEntryHistory
                    .AsNoTracking()
                    .ToListAsync();
            }
            catch (Exception ex)
            {
                throw new Exception(ex.Message, ex);
            }
        }

        public async Task<IrrigationPlanEntryHistory> GetByIdAsync(int id)
        {
            try
            {
                return await _context.IrrigationPlanEntryHistory
                    .AsNoTracking()
                    .FirstOrDefaultAsync(h => h.Id == id);
            }
            catch (Exception ex)
            {
                throw new Exception(ex.Message, ex);
            }
        }

        public async Task<List<IrrigationPlanEntryHistory>> GetByIrrigationPlanIdAsync(int irrigationPlanId)
        {
            try
            {
                return await _context.IrrigationPlanEntryHistory
                    .Where(h => h.IrrigationPlanId == irrigationPlanId)
                    .AsNoTracking()
                    .ToListAsync();
            }
            catch (Exception ex)
            {
                throw new Exception(ex.Message, ex);
            }
        }

        public async Task<List<IrrigationPlanEntryHistory>> GetByIrrigationModeIdAsync(int irrigationModeId)
        {
            try
            {
                return await _context.IrrigationPlanEntryHistory
                    .Where(h => h.IrrigationModeId == irrigationModeId)
                    .AsNoTracking()
                    .ToListAsync();
            }
            catch (Exception ex)
            {
                throw new Exception(ex.Message, ex);
            }
        }

        public async Task<List<IrrigationPlanEntryHistory>> GetByIrrigationPlanEntryIdAsync(int irrigationPlanEntryId)
        {
            try
            {
                return await _context.IrrigationPlanEntryHistory
                    .Where(h => h.IrrigationPlanEntryId == irrigationPlanEntryId)
                    .AsNoTracking()
                    .ToListAsync();
            }
            catch (Exception ex)
            {
                throw new Exception(ex.Message, ex);
            }
        }

        public async Task<List<IrrigationPlanEntryHistory>> GetByDateRangeAsync(DateTime startDate, DateTime endDate)
        {
            try
            {
                return await _context.IrrigationPlanEntryHistory
                    .Where(h => h.ExecutionStartTime >= startDate && h.ExecutionStartTime <= endDate)
                    .AsNoTracking()
                    .ToListAsync();
            }
            catch (Exception ex)
            {
                throw new Exception(ex.Message, ex);
            }
        }

        public async Task<List<IrrigationPlanEntryHistory>> GetByExecutionStatusAsync(string executionStatus)
        {
            try
            {
                return await _context.IrrigationPlanEntryHistory
                    .Where(h => h.ExecutionStatus == executionStatus)
                    .AsNoTracking()
                    .ToListAsync();
            }
            catch (Exception ex)
            {
                throw new Exception(ex.Message, ex);
            }
        }

        public async Task<List<IrrigationPlanEntryHistory>> GetActiveExecutionsAsync()
        {
            try
            {
                return await _context.IrrigationPlanEntryHistory
                    .Where(h => h.ExecutionStatus == "InProgress" || h.ExecutionStatus == "Scheduled")
                    .AsNoTracking()
                    .ToListAsync();
            }
            catch (Exception ex)
            {
                throw new Exception(ex.Message, ex);
            }
        }

        public async Task<List<IrrigationPlanEntryHistory>> GetTodayExecutionsAsync()
        {
            try
            {
                var today = DateTime.Today;
                var tomorrow = today.AddDays(1);

                return await _context.IrrigationPlanEntryHistory
                    .Where(h => h.ExecutionStartTime >= today && h.ExecutionStartTime < tomorrow)
                    .AsNoTracking()
                    .ToListAsync();
            }
            catch (Exception ex)
            {
                throw new Exception(ex.Message, ex);
            }
        }
    }
}
