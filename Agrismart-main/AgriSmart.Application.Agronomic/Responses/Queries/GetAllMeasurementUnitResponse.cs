using AgriSmart.Core.Entities;

namespace AgriSmart.Application.Agronomic.Responses.Queries
{
    public record GetAllMeasurementUnitResponse
    {
        public IReadOnlyList<MeasurementUnit>? MeasurementUnits { get; set; } = new List<MeasurementUnit>();
    }
}
