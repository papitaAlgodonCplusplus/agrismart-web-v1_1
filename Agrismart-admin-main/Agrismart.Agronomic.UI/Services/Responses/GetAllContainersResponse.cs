using Agrismart.Agronomic.UI.Services.Models;

namespace Agrismart.Agronomic.UI.Services.Responses
{
    public record GetAllContainersResponse
    {
        public IReadOnlyList<Container>? Containers { get; set; } = new List<Container>();
    }
}