namespace AgriSmart.Application.Agronomic.Responses.Commands
{
    public record UpdateCropPhaseOptimalResponse
    {
        public int Id { get; set; }
        public int CatalogId { get; set; }
        public string? Name { get; set; }
        public string? Description { get; set; }
        public double Value { get; set; }
        public bool? Active { get; set; }
    }
}