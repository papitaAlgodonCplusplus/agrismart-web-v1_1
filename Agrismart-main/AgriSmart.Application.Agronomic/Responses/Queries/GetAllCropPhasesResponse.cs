using AgriSmart.Core.Entities;

namespace AgriSmart.Application.Agronomic.Responses.Queries
{
    public record GetAllCropPhasesResponse
    {
        public IReadOnlyList<CropPhase>? CropPhases { get; set; } = new List<CropPhase>();
    }
}
