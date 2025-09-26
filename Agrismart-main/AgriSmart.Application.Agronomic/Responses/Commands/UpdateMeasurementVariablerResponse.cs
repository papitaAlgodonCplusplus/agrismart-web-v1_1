namespace AgriSmart.Application.Agronomic.Responses.Commands
{
    public record UpdateMeasurementVariablerResponse
    {
        public int Id { get; set; }
        public int MeasurementVariableStandardId { get; set; }
        public int CatalogId { get; set; }
        public string Name { get; set; }
        public int MeasurementUnitId { get; set; }
        public double FactorToMeasurementVariableStandard { get; set; }
        public bool? Active { get; set; }
    }
}
