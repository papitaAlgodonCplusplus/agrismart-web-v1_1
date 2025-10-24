using AgriSmart.Core.Entities;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace AgriSmart.Core.Repositories.Commands
{
    public interface IIrrigationModeCommandRepository
    {
        Task<IrrigationMode> AddAsync(IrrigationMode irrigationMode);
        Task<IrrigationMode> UpdateAsync(IrrigationMode irrigationMode);
        Task DeleteAsync(IrrigationMode irrigationMode);
        int GetSessionUserId();
    }
}

namespace AgriSmart.Core.Repositories.Queries
{
    public interface IIrrigationModeQueryRepository
    {
        Task<List<IrrigationMode>> GetAllAsync();
        Task<IrrigationMode> GetByIdAsync(int id);
    }
}