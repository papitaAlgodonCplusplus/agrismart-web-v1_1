namespace Agrismart.Agronomic.UI.Services.Requests.Commands
{
    public record CreateMeasurementVariableRequest
    {
        public int MeasurementVariableStandardId { get; set; }
        public int CatalogId { get; set; }
        public string? Name { get; set; }
        public int MeasurementUnitId { get; set; }
        public double FactorToMeasurementVariableStandard { get; set; }
    }
}