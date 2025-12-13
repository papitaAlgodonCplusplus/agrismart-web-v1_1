using AgriSmart.Core.Entities;

namespace AgriSmart.Core.Repositories.Commands
{
    public interface ICropProductionSpecsCommandRepository
    {
        Task<CropProductionSpecs> CreateAsync(CropProductionSpecs entity);
        Task<CropProductionSpecs> UpdateAsync(CropProductionSpecs entity);
        Task<bool> DeleteAsync(int id, int deletedBy);
    }
}
