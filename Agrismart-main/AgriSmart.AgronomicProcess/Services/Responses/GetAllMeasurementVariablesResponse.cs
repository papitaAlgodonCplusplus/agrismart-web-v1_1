using AgriSmart.AgronomicProcess.Entities;
using AgriSmart.AgronomicProcess.Models;

namespace AgriSmart.Calculator.Services.Responses
{
    public record GetAllMeasurementVariablesResponse
    {
        public IReadOnlyList<MeasurementVariable>? MeasurementVariables { get; set; } = new List<MeasurementVariable>();
    }
}
