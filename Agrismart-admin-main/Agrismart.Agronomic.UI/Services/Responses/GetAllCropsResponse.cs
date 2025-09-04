using Agrismart.Agronomic.UI.Services.Models;

namespace Agrismart.Agronomic.UI.Services.Responses
{
    public record GetAllCropsResponse
    {
        public IReadOnlyList<Crop>? Crops { get; set; } = new List<Crop>();
    }
}
