namespace Agrismart.Agronomic.UI.Services.Models
{
    public record MeasurementUnit
    {
        public int Id { get; set; }
        public string? Name { get; set; }
        public string? Symbol { get; set; }
        public int MeasureType { get; set; }
        public int BaseMeasureUnitId { get; set; }
        public double ConvertionFactorToBase { get; set; }
        public bool Active { get; set; }
        public DateTime? DateCreated { get; set; }
        public DateTime? DateUpdated { get; set; }
        public int? CreatedBy { get; set; }
        public int? UpdatedBy { get; set; }
    }
}