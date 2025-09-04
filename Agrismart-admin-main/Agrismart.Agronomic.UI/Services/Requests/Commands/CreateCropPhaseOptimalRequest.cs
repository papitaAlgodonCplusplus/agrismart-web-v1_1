namespace Agrismart.Agronomic.UI.Services.Requests.Commands
{
    public record CreateCropPhaseOptimalRequest
    {
        public int CatalogId { get; set; }
        public string? Name { get; set; }
        public string? Description { get; set; }
        public double Value { get; set; }
    }
}