using AgriSmart.AgronomicProcess.Models;

namespace AgriSmart.AgronomicProcess.Services.Responses
{
    public record GetAllIrrigationMeasurementsResponse
    {
        public IReadOnlyList<IrrigationMeasurement>? IrrigationMeasurements { get; set; } = new List<IrrigationMeasurement>();
    }
}
