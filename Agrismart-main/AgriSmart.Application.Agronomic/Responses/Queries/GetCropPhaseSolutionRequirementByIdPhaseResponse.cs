using AgriSmart.Core.Entities;

namespace AgriSmart.Application.Agronomic.Responses.Queries
{
    public record GetCropPhaseSolutionRequirementByIdPhaseResponse
    {
        public CropPhaseSolutionRequirement? CropPhaseSolutionRequirement { get; set; } = new CropPhaseSolutionRequirement();
    }
}