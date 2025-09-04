using Agrismart.Agronomic.UI.Services.Models;

namespace Agrismart.Agronomic.UI.Services.Responses
{
    public record GetAllCropPhasesResponse
    {
        public IReadOnlyList<CropPhase>? CropPhases { get; set; } = new List<CropPhase>();
    }
}