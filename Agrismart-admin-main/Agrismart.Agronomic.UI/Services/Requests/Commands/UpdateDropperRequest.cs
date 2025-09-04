namespace Agrismart.Agronomic.UI.Services.Requests.Commands
{
    public record UpdateDropperRequest
    {
        public int Id { get; set; }
        public int CatalogId { get; set; }
        public string? Name { get; set; }
        public double? FlowRate { get; set; }
        public bool Active { get; set; }
    }
}
