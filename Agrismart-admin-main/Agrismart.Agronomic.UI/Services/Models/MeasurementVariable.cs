namespace Agrismart.Agronomic.UI.Services.Models
{
    public record MeasurementVariable
    {
        public int Id { get; set; }
        public int MeasurementVariableStandardId { get; set; }
        public int CatalogId { get; set; }
        public string? Name { get; set; }
        public int MeasurementUnitId { get; set; }
        public double FactorToMeasurementVariableStandard { get; set; }
        public bool Active { get; set; }
        public DateTime? DateCreated { get; set; }
        public DateTime? DateUpdated { get; set; }
        public int? CreatedBy { get; set; }
        public int? UpdatedBy { get; set; }
    }
}