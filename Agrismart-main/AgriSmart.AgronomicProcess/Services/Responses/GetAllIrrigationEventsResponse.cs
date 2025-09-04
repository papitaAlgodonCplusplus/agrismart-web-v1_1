using AgriSmart.AgronomicProcess.Models;

namespace AgriSmart.AgronomicProcess.Services.Responses
{
    public record GetAllIrrigationEventsResponse
    {
        public IReadOnlyList<IrrigationEvent>? IrrigationEvents { get; set; } = new List<IrrigationEvent>();
    }
}
