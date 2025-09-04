using Agrismart.Agronomic.UI.Pages;
using Agrismart.Agronomic.UI.Services.Models;

namespace Agrismart.Agronomic.UI.Services.Responses
{
    public record GetAllCropPhaseOptimalsResponse
    {
        public IReadOnlyList<CropPhaseOptimal>? CropPhaseOptimals { get; set; } = new List<CropPhaseOptimal>();
    }
}