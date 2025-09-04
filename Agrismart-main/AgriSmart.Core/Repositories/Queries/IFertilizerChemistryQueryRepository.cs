using AgriSmart.Core.Entities;

namespace AgriSmart.Core.Repositories.Queries
{
    public interface IFertilizerChemistryQueryRepository
    {
        Task<IReadOnlyList<FertilizerChemistry>> GetAllAsync(int fertilizerId = 0, int catalogId = 0, bool includeInactives = false);
        Task<FertilizerChemistry?> GetByIdAsync(int id);
    }
}
