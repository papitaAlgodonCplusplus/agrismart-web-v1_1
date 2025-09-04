namespace Agrismart.Agronomic.UI.Services.Requests.Commands
{
    public record CreateCatalogRequest
    {
        public int ClientId { get; set; }
        public string? Name { get; set; }
    }
}