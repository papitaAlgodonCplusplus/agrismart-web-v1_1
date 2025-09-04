using AgriSmart.Core.Entities;

namespace AgriSmart.Application.Agronomic.Responses.Queries
{
    public record GetAllMeasurementKPIsResponse
    {
        public IReadOnlyList<MeasurementKPI>? MeasurementKPIs { get; set; } = new List<MeasurementKPI>();
    }
}
