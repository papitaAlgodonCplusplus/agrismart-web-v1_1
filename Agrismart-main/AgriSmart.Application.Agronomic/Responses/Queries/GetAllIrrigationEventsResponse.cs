using AgriSmart.Core.Entities;

namespace AgriSmart.Application.Agronomic.Responses.Queries
{
    public record GetAllIrrigationEventsResponse
    {
        public IReadOnlyList<IrrigationEvent>? IrrigationEvents { get; set; } = new List<IrrigationEvent>();
    }
}