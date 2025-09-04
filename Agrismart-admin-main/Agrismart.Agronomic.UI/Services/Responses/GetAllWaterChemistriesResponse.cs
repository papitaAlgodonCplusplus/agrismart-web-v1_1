using Agrismart.Agronomic.UI.Services.Models;

namespace Agrismart.Agronomic.UI.Services.Responses
{
    public record GetAllWaterChemistriesResponse
    {
        public IReadOnlyList<WaterChemistry>? WaterChemistries { get; set; } = new List<WaterChemistry>();
    }
}