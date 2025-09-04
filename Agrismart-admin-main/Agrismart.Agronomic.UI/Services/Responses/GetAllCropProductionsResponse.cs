using Agrismart.Agronomic.UI.Services.Models;

namespace Agrismart.Agronomic.UI.Services.Responses
{
    public record GetAllCropProductionsResponse
    {
        public IReadOnlyList<CropProduction>? CropProductions { get; set; } = new List<CropProduction>();
    }
}