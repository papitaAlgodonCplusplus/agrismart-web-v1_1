using AgriSmart.Core.Entities;

namespace AgriSmart.Application.Agronomic.Responses.Queries
{
    public record GetAllWaterResponse
    {
        public IReadOnlyList<Water>? Waters { get; set; } = new List<Water>();
    }
}
