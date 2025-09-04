using AgriSmart.Calculator.Entities;
using AgriSmart.Calculator.Models;

namespace AgriSmart.Calculator.Services.Responses
{
    public record GetAllIrrigationEventsResponse
    {
        public IReadOnlyList<IrrigationEvent>? IrrigationEvents { get; set; } = new List<IrrigationEvent>();
    }
}
