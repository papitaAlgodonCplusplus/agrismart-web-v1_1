using Agrismart.Agronomic.UI.Services.Models;

namespace Agrismart.Agronomic.UI.Services.Responses
{
    public record GetAllFarmsResponse
    {
        public IReadOnlyList<Farm>? Farms { get; set; } = new List<Farm>();
    }
}