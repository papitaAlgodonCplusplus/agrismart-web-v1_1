namespace AgriSmart.Application.Agronomic.Responses.Commands
{
    public record UpdateCatalogResponse
    {
        public int Id { get; set; }
        public int ClientId { get; set; }
        public string? Name { get; set; }
        public bool? Active { get; set; }
    }
}
