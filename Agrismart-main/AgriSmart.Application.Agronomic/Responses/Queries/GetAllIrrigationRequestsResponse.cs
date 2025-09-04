using AgriSmart.Core.Entities;

namespace AgriSmart.Application.Agronomic.Responses.Queries
{
    public record GetAllIrrigationRequestsResponse
    {
        public IReadOnlyList<IrrigationRequest>? IrrigationRequests { get; set; } = new List<IrrigationRequest>();
    }
}