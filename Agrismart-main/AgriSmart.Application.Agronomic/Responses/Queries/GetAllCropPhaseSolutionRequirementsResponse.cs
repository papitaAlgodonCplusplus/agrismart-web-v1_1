using AgriSmart.Core.Entities;

namespace AgriSmart.Application.Agronomic.Responses.Queries
{
    public record GetAllCropPhaseSolutionRequirementsResponse
    {
        public IReadOnlyList<CropPhaseSolutionRequirement>? CropPhaseRequirements { get; set; } = new List<CropPhaseSolutionRequirement>();
    }
}