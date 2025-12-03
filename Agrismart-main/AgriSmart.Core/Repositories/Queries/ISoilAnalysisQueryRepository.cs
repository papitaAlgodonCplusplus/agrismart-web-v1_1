using AgriSmart.Core.Entities;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace AgriSmart.Core.Repositories.Queries
{
    public interface ISoilAnalysisQueryRepository : IBaseQueryRepository<SoilAnalysis>
    {
        Task<List<SoilAnalysis>> GetByCropProductionIdAsync(int cropProductionId, bool includeInactive = false);
        Task<SoilAnalysis> GetByIdAsync(int id);
        Task<SoilAnalysis> GetLatestByCropProductionIdAsync(int cropProductionId);
        Task<List<SoilTextureClass>> GetAllTextureClassesAsync();
        Task<Dictionary<string, decimal>> GetAvailableNutrientsAsync(int soilAnalysisId);
        Task<string> DetermineTextureClassAsync(decimal sand, decimal silt, decimal clay);
    }
}
