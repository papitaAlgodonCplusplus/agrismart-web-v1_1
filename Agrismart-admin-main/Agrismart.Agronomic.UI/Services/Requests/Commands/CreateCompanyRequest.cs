namespace Agrismart.Agronomic.UI.Services.Requests.Commands
{
    public record CreateCompanyRequest
    {
        public int ClientId { get; set; }
        public int CatalogId { get; set; }
        public string? Name { get; set; }
        public string? Description { get; set; }
    }
}