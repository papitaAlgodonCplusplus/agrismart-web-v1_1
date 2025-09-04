using AgriSmart.Calculator.Models;

namespace AgriSmart.Calculator.Services.Responses
{
    public record GetAllMeasurementKPIsResponse
    {
        public IReadOnlyList<MeasurementKPI>? MeasurementKPIs { get; set; } = new List<MeasurementKPI>();
    }
}
