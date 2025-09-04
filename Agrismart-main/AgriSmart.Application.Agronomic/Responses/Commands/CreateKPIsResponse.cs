using AgriSmart.Core.Entities;

namespace AgriSmart.Application.Agronomic.Responses.Commands
{
    public record CreateKPIsResponse
    {
        public List<MeasurementKPI> MeasurementKPI { get; set; }
    }
}
