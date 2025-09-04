namespace Agrismart.Agronomic.UI.Services.Requests.Commands
{
    public record CreateWaterRequest
    {
        public int CatalogId { get; set; } = 0;
        public string? Name { get; set; }
    }
}