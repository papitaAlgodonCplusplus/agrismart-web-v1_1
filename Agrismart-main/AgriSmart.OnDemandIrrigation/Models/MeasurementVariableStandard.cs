namespace AgriSmart.OnDemandIrrigation.Models
{
    public record MeasurementVariableStandard
    {
        public int Id { get; set; }
        public string? Name { get; set; }
        public int MeasurementUnitId { get; set; }
        public bool Active { get; set; }
    }
}