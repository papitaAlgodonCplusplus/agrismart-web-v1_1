namespace AgriSmart.Application.Agronomic.Responses.Commands
{
    public record UpdateDropperResponse
    {
        public int Id { get; set; }
        public int CatalogId { get; set; }
        public string? Name { get; set; }
        public double FlowRate { get; set; }
        public bool? Active { get; set; }
    }
}
