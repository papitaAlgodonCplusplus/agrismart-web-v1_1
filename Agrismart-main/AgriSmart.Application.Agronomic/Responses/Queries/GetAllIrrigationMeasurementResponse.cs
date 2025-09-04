using AgriSmart.Core.Entities;

namespace AgriSmart.Application.Agronomic.Responses.Queries
{
    public record GetAllIrrigationMeasurementResponse
    {
        public IReadOnlyList<IrrigationMeasurement>? IrrigationMeasurements { get; set; } = new List<IrrigationMeasurement>();
    }
}