using AgriSmart.Core.Entities;

namespace AgriSmart.Application.Agronomic.Responses.Queries
{
    public record GetAllContainersResponse
    {
        public IReadOnlyList<Container>? Containers { get; set; } = new List<Container>();
    }
}
