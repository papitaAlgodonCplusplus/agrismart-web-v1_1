using AgriSmart.OnDemandIrrigation.Models;

namespace AgriSmart.OnDemandIrrigation.Services.Responses
{
    public record GetAllMeasurementVariablesResponse
    {
        public IReadOnlyList<MeasurementVariable>? MeasurementVariables { get; set; } = new List<MeasurementVariable>();
    }
}
