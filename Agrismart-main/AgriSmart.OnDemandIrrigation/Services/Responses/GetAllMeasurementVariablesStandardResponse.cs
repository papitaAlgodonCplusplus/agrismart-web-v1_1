using AgriSmart.OnDemandIrrigation.Models;

namespace AgriSmart.OnDemandIrrigation.Services.Responses
{
    public record GetAllMeasurementVariablesStandardResponse
    {
        public IReadOnlyList<MeasurementVariableStandard>? MeasurementVariablesStandard { get; set; } = new List<MeasurementVariableStandard>();
    }
}
