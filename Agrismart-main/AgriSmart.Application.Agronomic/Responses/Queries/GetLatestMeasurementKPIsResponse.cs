using AgriSmart.Core.Entities;

namespace AgriSmart.Application.Agronomic.Responses.Queries
{
    public record GetLatestMeasurementKPIsResponse
    {
        public MeasurementKPI? LatestMeasurementKPIs { get; set; } = new MeasurementKPI();
    }
}
