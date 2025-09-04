using AgriSmart.Core.Entities;

namespace AgriSmart.Application.Agronomic.Responses.Queries
{
    public record GetAllWatersResponse
    {
        public IReadOnlyList<Water>? Waters { get; set; } = new List<Water>();
    }
}