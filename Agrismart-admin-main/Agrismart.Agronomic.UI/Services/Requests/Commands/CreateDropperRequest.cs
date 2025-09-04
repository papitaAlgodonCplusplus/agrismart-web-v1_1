namespace Agrismart.Agronomic.UI.Services.Requests.Commands
{
    public record CreateDropperRequest
    {
        public int CatalogId { get; set; }
        public string? Name { get; set; }
        public double? FlowRate { get; set; }
    }
}
