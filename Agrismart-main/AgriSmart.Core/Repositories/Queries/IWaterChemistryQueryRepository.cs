using AgriSmart.Core.Entities;

namespace AgriSmart.Core.Repositories.Queries
{
    public interface IWaterChemistryQueryRepository
    {
        Task<IReadOnlyList<WaterChemistry>> GetAllAsync(int waterId =0, int catalogId = 0, bool includeInactives = false);
        Task<WaterChemistry> GetByIdAsync(int id);
    }
}