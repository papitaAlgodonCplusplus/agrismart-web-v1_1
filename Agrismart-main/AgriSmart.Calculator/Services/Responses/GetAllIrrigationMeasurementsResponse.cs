using AgriSmart.Calculator.Entities;
using AgriSmart.Calculator.Models;

namespace AgriSmart.Calculator.Services.Responses
{
    public record GetAllIrrigationMeasurementsResponse
    {
        public IReadOnlyList<IrrigationMeasurement>? IrrigationMeasurements { get; set; } = new List<IrrigationMeasurement>();
    }
}
