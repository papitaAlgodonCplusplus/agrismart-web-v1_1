using AgriSmart.OnDemandIrrigation.Models;

namespace AgriSmart.OnDemandIrrigation.Services.Responses
{
    public record GetAllMeasurementsResponse
    {
        public IReadOnlyList<Measurement>? Measurements { get; set; } = new List<Measurement>();
    }
}
