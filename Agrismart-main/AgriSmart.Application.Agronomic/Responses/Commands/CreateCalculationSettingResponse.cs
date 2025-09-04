namespace AgriSmart.Application.Agronomic.Responses.Commands
{
    public record CreateCalculationSettingResponse
    {
        public int Id { get; set; }
        public int CatalogId { get; set; }
        public string? Name { get; set; }
        public double Value { get; set; }
        public bool Active { get; set; }
    }
}