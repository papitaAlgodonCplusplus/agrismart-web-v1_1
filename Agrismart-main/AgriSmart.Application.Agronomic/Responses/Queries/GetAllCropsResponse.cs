using AgriSmart.Core.Entities;

namespace AgriSmart.Application.Agronomic.Responses.Queries
{
    public record GetAllCropsResponse
    {
        public IReadOnlyList<Crop>? Crops { get; set; } = new List<Crop>();
    }
}
