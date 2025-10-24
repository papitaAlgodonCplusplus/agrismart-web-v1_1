using AgriSmart.Core.Entities;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace AgriSmart.Core.Repositories.Queries
{
    public interface IIrrigationPlanQueryRepository
    {
        Task<List<IrrigationPlan>> GetAllAsync();
        Task<IrrigationPlan> GetByIdAsync(int id);
    }
}