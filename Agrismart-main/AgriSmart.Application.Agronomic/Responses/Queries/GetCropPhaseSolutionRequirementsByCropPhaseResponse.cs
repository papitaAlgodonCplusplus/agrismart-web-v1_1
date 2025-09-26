using AgriSmart.Core.Entities;

namespace AgriSmart.Application.Agronomic.Responses.Queries
{
    public record GetCropPhaseSolutionRequirementsByCropPhaseResponse
    {
        public IReadOnlyList<CropPhaseSolutionRequirement>? CropPhaseSolutionRequirements { get; set; } = new List<CropPhaseSolutionRequirement>();
    }
}