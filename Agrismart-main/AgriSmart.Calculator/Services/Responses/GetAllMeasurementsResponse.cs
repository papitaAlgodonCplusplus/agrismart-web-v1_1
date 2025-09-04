using AgriSmart.Calculator.Models;

namespace AgriSmart.Calculator.Services.Responses
{
    public record GetAllMeasurementsResponse
    {
        public IReadOnlyList<Measurement>? Measurements { get; set; } = new List<Measurement>();
    }
}
