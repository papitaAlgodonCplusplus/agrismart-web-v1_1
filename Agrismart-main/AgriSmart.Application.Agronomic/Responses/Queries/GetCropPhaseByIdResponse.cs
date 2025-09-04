using AgriSmart.Core.Entities;

namespace AgriSmart.Application.Agronomic.Responses.Queries
{
    public record GetCropPhaseByIdResponse
    {
        public CropPhase? CropPhase { get; set; } = new CropPhase();
    }
}
