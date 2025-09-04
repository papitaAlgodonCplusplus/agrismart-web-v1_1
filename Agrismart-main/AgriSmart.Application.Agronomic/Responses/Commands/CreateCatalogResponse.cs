namespace AgriSmart.Application.Agronomic.Responses.Commands
{
    public record CreateCatalogResponse
    {
        public int Id { get; set; } 
        public int ClientId { get; set; }
        public string? Name { get; set; }
        public bool Active { get; set; }
    }
}
