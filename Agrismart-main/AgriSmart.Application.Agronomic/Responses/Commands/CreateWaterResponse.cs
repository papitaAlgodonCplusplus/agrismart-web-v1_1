namespace AgriSmart.Application.Agronomic.Responses.Commands
{
    public record CreateWaterResponse
    {
        public int Id { get; set; } 
        public int CatalogId { get; set; }
        public string? Name { get; set; }
        public bool? Active { get; set; }
    }
}