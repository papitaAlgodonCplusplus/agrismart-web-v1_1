using AgriSmart.Core.Entities;

namespace AgriSmart.Core.Repositories.Queries
{
    public interface ICropProductionIrrigationSectorQueryRepository
    {
        Task<IReadOnlyList<CropProductionIrrigationSector>> GetAllAsync(int companyId = 0, int farmId = 0, int productionUnitId = 0, int cropProductionId = 0, bool includeInactives = false);
        Task<CropProductionIrrigationSector?> GetByIdAsync(int id);
    }
}
