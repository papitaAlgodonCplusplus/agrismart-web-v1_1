namespace Agrismart.Agronomic.UI.Services.Requests.Commands
{
    public record CreateCalculationSettingRequest
    {
        public int CatalogId { get; set; }
        public string? Name { get; set; }
        public double Value { get; set; }
    }
}