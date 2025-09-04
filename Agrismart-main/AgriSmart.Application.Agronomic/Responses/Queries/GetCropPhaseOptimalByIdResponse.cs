using AgriSmart.Core.Entities;

namespace AgriSmart.Application.Agronomic.Responses.Queries
{
    public record GetCropPhaseOptimalByIdResponse
    {
        public CropPhaseOptimal? CropPhaseOptimal { get; set; } = new CropPhaseOptimal();
    }
}