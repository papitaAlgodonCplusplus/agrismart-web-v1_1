using AgriSmart.Core.Entities;

namespace AgriSmart.Application.Agronomic.Responses.Queries
{
    public record GetAllGraphsResponse
    {
        public IReadOnlyList<Graph>? Graphs { get; set; } = new List<Graph>();
    }
}
