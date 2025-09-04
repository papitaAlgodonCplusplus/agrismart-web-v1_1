namespace Agrismart.Agronomic.UI.Services.Responses
{
    public record CatalogResponse
    {
        public int Id { get; set; }
        public int ClientId { get; set; }
        public string? Name { get; set; }
        public bool Active { get; set; }
    }
}