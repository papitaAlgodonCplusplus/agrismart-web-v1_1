namespace Agrismart.Agronomic.UI.Services.Requests.Commands
{
    public record CreateFertilizerRequest
    {
        public int CatalogId { get; set; }
        public string? Name { get; set; }
        public string? Manufacturer { get; set; }
        public bool IsLiquid { get; set; }
    }
}
