namespace AgriSmart.AgronomicProcess.Models
{
    public record GetAllMeasurementsResponse
    {
        public IReadOnlyList<Measurement>? Measurements { get; set; } = new List<Measurement>();
    }
}
