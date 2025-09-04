namespace Agrismart.Agronomic.UI.Services.Requests.Commands
{
    public record UpdateCompanyRequest
    {
        public int Id { get; set; }
        public int ClientId { get; set; }
        public int CatalogId { get; set; }
        public string? Name { get; set; }
        public string? Description { get; set; }
        public bool Active { get; set; }
    }
}
