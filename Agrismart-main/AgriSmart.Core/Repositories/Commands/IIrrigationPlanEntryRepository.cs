using AgriSmart.Core.Entities;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace AgriSmart.Core.Repositories.Commands
{
    public interface IIrrigationPlanEntryCommandRepository
    {
        Task<IrrigationPlanEntry> AddAsync(IrrigationPlanEntry irrigationPlanEntry);
        Task<IrrigationPlanEntry> UpdateAsync(IrrigationPlanEntry irrigationPlanEntry);
        Task<List<IrrigationPlanEntry>> GetBySectorCompanyCropAsync(int? sectorId, int? companyId, int? cropId);
        Task DeleteAsync(IrrigationPlanEntry irrigationPlanEntry);
        int GetSessionUserId();
    }
}

namespace AgriSmart.Core.Repositories.Queries
{
    public interface IIrrigationPlanEntryQueryRepository
    {
        Task<List<IrrigationPlanEntry>> GetAllAsync();
        Task<IrrigationPlanEntry> GetByIdAsync(int id);
        Task<List<IrrigationPlanEntry>> GetByIrrigationPlanIdAsync(int irrigationPlanId);
        Task<List<IrrigationPlanEntry>> GetByIrrigationModeIdAsync(int irrigationModeId);
        Task<List<IrrigationPlanEntry>> GetBySectorCompanyCropAsync(int? sectorId, int? companyId, int? cropId);
    }
}