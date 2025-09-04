using Agrismart.Agronomic.UI.Services.Models;

namespace Agrismart.Agronomic.UI.Services.Responses
{
    public record GetAllFertilizersResponse
    {
        public IReadOnlyList<Fertilizer>? Fertilizers { get; set; } = new List<Fertilizer>();
    }
}