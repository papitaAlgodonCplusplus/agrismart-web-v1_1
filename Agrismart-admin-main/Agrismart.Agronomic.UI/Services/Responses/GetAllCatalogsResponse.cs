using Agrismart.Agronomic.UI.Services.Models;

namespace Agrismart.Agronomic.UI.Services.Responses
{
    public record GetAllCatalogsResponse
    {
        public IReadOnlyList<Catalog>? Catalogs { get; set; } = new List<Catalog>();
    }
}
