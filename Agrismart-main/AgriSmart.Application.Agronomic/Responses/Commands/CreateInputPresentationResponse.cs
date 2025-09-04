namespace AgriSmart.Application.Agronomic.Responses.Commands
{
    public record CreateInputPresentationResponse
    {
        public int CatalogId { get; set; }
        public string? Name { get; set; }
        public int MeasurementUnitId { get; set; }
        public string? Description { get; set; }
        public double Quantity { get; set; }
        public bool Active { get; set; }
    }
}