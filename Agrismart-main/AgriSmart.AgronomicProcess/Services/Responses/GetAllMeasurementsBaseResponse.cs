namespace AgriSmart.AgronomicProcess.Models
{
    public record GetAllMeasurementsBaseResponse
    {
        public IReadOnlyList<MeasurementBase>? Measurements { get; set; } = new List<MeasurementBase>();
    }
}
