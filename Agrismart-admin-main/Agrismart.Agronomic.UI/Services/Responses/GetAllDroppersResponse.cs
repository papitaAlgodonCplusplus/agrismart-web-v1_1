using Agrismart.Agronomic.UI.Services.Models;

namespace Agrismart.Agronomic.UI.Services.Responses
{
    public record GetAllDroppersResponse
    {
        public IReadOnlyList<Dropper>? Droppers { get; set; } = new List<Dropper>();
    }
}