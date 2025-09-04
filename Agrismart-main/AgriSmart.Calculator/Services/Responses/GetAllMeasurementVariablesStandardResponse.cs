using AgriSmart.Calculator.Models;

namespace AgriSmart.Calculator.Services.Responses
{
    public record GetAllMeasurementVariablesStandardResponse
    {
        public IReadOnlyList<MeasurementVariableStandard>? MeasurementVariablesStandard { get; set; } = new List<MeasurementVariableStandard>();
    }
}
