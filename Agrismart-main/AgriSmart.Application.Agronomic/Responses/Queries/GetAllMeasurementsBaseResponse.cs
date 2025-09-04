using AgriSmart.Core.Entities;

namespace AgriSmart.Application.Agronomic.Responses.Queries
{
    public record GetAllMeasurementsBaseResponse
    {
        public IReadOnlyList<MeasurementBase>? Measurements { get; set; } = new List<MeasurementBase>();
    }
}
