using AgriSmart.Core.Entities;

namespace AgriSmart.Core.Repositories.Queries
{
    public interface ICropPhaseSolutionRequirementQueryRepository
    {
        Task<CropPhaseSolutionRequirement?> GetByIdAsync(int id);
        Task<CropPhaseSolutionRequirement?> GetByIdPhaseAsync(int phaseId, bool includeInactives);
        Task<IReadOnlyList<CropPhaseSolutionRequirement>?> GetAllAsync(int? cropPhaseId, int? phaseId, bool includeInactives, bool includeValidatedOnly);
        Task<IReadOnlyList<CropPhaseSolutionRequirement>?> GetByCropPhaseAsync(int cropPhaseId, bool includeInactives);
    }
}