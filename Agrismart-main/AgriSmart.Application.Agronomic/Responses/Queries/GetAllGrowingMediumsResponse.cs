using AgriSmart.Core.Entities;

namespace AgriSmart.Application.Agronomic.Responses.Queries
{
    public record GetAllGrowingMediumsResponse
    {
        public IReadOnlyList<GrowingMedium>? GrowingMediums { get; set; } = new List<GrowingMedium>();
    }
}
