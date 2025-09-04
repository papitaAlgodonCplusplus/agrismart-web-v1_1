using AgriSmart.Core.Entities;

namespace AgriSmart.Application.Agronomic.Responses.Queries
{
    public record GetAllFertilizersResponse
    {
        public IReadOnlyList<Fertilizer>? Fertilizers { get; set; } = new List<Fertilizer>();
    }
}
