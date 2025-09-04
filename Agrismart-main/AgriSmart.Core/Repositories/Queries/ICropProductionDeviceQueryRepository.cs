using AgriSmart.Core.Entities;

namespace AgriSmart.Core.Repositories.Queries
{
    public interface ICropProductionDeviceQueryRepository
    {
        Task<IReadOnlyList<CropProductionDevice>> GetAllAsync(int cropProductionId = 0);
    }
}
