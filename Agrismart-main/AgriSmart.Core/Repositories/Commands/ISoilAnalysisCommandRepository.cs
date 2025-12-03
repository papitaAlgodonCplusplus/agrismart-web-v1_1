using AgriSmart.Core.Entities;
using System.Threading.Tasks;

namespace AgriSmart.Core.Repositories.Commands
{
    public interface ISoilAnalysisCommandRepository : IBaseCommandRepository<SoilAnalysis>
    {
        Task<SoilAnalysis> CreateWithCalculationsAsync(SoilAnalysis soilAnalysis);
        Task<SoilAnalysis> UpdateWithCalculationsAsync(SoilAnalysis soilAnalysis);
        Task<bool> SoftDeleteAsync(int id);
    }
}
