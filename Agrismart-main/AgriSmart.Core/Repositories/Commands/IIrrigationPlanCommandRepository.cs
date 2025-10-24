using AgriSmart.Core.Entities;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace AgriSmart.Core.Repositories.Commands
{
    public interface IIrrigationPlanCommandRepository
    {
        Task<IrrigationPlan> AddAsync(IrrigationPlan irrigationPlan);
        Task<IrrigationPlan> UpdateAsync(IrrigationPlan irrigationPlan);
        Task DeleteAsync(IrrigationPlan irrigationPlan);
        int GetSessionUserId();
    }
}