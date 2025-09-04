namespace Agrismart.Agronomic.UI.Services.Requests.Commands
{
    public record UpdateCatalogRequest
    {
        public int Id { get; set; }
        public int ClientId { get; set; }
        public string? Name { get; set; }
        public bool Active { get; set; }
    }
}