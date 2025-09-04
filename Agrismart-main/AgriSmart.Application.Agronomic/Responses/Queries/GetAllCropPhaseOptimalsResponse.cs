using AgriSmart.Core.Entities;

namespace AgriSmart.Application.Agronomic.Responses.Queries
{
    public record GetAllCropPhaseOptimalsResponse
    {
        public IReadOnlyList<CropPhaseOptimal>? CropPhaseOptimals { get; set; } = new List<CropPhaseOptimal>();
    }
}