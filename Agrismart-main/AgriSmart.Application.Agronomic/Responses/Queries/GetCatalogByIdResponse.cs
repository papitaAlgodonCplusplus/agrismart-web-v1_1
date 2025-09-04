using AgriSmart.Core.Entities;

namespace AgriSmart.Application.Agronomic.Responses.Queries
{
    public record GetCatalogByIdResponse
    {
        public Catalog? Catalog { get; set; } = new Catalog();
    }
}
