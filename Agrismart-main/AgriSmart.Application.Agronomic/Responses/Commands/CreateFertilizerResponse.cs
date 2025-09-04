namespace AgriSmart.Application.Agronomic.Responses.Commands
{
    public record CreateFertilizerResponse
    {
        public int Id { get; set; } 
        public int CatalogId { get; set; }
        public string? Name { get; set; }
        public string? Manufacturer { get; set; }
        public bool IsLiquid { get; set; }
        public bool Active { get; set; }
    }
}
