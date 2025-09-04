using AgriSmart.Calculator.Models;

namespace AgriSmart.Calculator.Services.Responses
{
    public record GetLatestMeasurementKPIsResponse
    {
        public MeasurementKPI? LatestMeasurementKPIs { get; set; } = new MeasurementKPI();
    }
}
