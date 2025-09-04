using AgriSmart.Core.Entities;

namespace AgriSmart.Core.Repositories.Queries
{
    public interface ICropPhaseSolutionRequirementQueryRepository
    {
        Task<CropPhaseSolutionRequirement?> GetByIdPhaseAsync(int phaseId, bool includeInactives);
    }
}