using AgriSmart.Core.Entities;

namespace AgriSmart.Core.Repositories.Query
{
    public interface ICropProductionSpecsQueryRepository
    {
        Task<IReadOnlyList<CropProductionSpecs>> GetAllAsync(bool includeInactives = false);
        Task<CropProductionSpecs?> GetByIdAsync(int id);
    }
}
