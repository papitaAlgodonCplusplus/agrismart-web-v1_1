using AgriSmart.Core.Entities;

namespace AgriSmart.Application.Agronomic.Responses.Queries
{
    public record GetAllMeasurementsResponse
    {
        public IReadOnlyList<Measurement>? Measurements { get; set; } = new List<Measurement>();
    }
}
