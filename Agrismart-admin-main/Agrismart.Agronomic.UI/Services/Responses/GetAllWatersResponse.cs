using Agrismart.Agronomic.UI.Services.Models;

namespace Agrismart.Agronomic.UI.Services.Responses
{
    public record GetAllWatersResponse
    {
        public IReadOnlyList<Water>? Waters { get; set; } = new List<Water>();
    }
}