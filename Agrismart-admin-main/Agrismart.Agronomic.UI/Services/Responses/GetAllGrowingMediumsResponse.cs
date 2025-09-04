using Agrismart.Agronomic.UI.Services.Models;

namespace Agrismart.Agronomic.UI.Services.Responses
{
    public record GetAllGrowingMediumsResponse
    {
        public IReadOnlyList<GrowingMedium>? GrowingMediums { get; set; } = new List<GrowingMedium>();
    }
}