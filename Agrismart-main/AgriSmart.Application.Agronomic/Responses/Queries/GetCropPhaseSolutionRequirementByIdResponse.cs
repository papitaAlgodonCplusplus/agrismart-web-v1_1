using AgriSmart.Core.Entities;

namespace AgriSmart.Application.Agronomic.Responses.Queries
{
    public record GetCropPhaseSolutionRequirementByIdResponse
    {
        public CropPhaseSolutionRequirement? CropPhaseSolutionRequirement { get; set; }
    }
}