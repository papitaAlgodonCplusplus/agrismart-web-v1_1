using AgriSmart.AgronomicProcess.Models;

namespace AgriSmart.AgronomicProcess.Services.Responses
{
    public record GetLatestMeasurementKPIsResponse
    {
        public MeasurementKPI? LatestMeasurementKPIs { get; set; } = new MeasurementKPI();
    }
}
