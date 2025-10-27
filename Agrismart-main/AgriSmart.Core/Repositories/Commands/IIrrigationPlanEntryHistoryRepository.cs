// Agrismart-main/AgriSmart.Core/Repositories/Commands/IIrrigationPlanEntryHistoryRepository.cs
using AgriSmart.Core.Entities;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace AgriSmart.Core.Repositories.Commands
{
    public interface IIrrigationPlanEntryHistoryCommandRepository
    {
        Task<IrrigationPlanEntryHistory> AddAsync(IrrigationPlanEntryHistory history);
        Task<IrrigationPlanEntryHistory> UpdateAsync(IrrigationPlanEntryHistory history);
        Task DeleteAsync(IrrigationPlanEntryHistory history);
        int GetSessionUserId();
    }
}

namespace AgriSmart.Core.Repositories.Queries
{
    public interface IIrrigationPlanEntryHistoryQueryRepository
    {
        Task<List<IrrigationPlanEntryHistory>> GetAllAsync();
        Task<IrrigationPlanEntryHistory> GetByIdAsync(int id);
        Task<List<IrrigationPlanEntryHistory>> GetByIrrigationPlanIdAsync(int irrigationPlanId);
        Task<List<IrrigationPlanEntryHistory>> GetByIrrigationModeIdAsync(int irrigationModeId);
        Task<List<IrrigationPlanEntryHistory>> GetByIrrigationPlanEntryIdAsync(int irrigationPlanEntryId);
        Task<List<IrrigationPlanEntryHistory>> GetByDateRangeAsync(DateTime startDate, DateTime endDate);
        Task<List<IrrigationPlanEntryHistory>> GetByExecutionStatusAsync(string executionStatus);
        Task<List<IrrigationPlanEntryHistory>> GetActiveExecutionsAsync();
        Task<List<IrrigationPlanEntryHistory>> GetTodayExecutionsAsync();
    }
}