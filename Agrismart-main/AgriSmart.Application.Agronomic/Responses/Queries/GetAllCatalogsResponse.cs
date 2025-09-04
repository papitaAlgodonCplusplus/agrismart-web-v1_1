using AgriSmart.Core.Entities;

namespace AgriSmart.Application.Agronomic.Responses.Queries
{
    public record GetAllCatalogsResponse
    {
        public IReadOnlyList<Catalog>? Catalogs { get; set; } = new List<Catalog>();
    }
}
