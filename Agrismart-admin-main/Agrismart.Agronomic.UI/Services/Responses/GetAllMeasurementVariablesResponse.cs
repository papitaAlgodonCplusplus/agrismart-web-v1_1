using Agrismart.Agronomic.UI.Services.Models;

namespace Agrismart.Agronomic.UI.Services.Responses
{
    public record GetAllMeasurementVariablesResponse
    {
        public IReadOnlyList<MeasurementVariable>? MeasurementVariables { get; set; } = new List<MeasurementVariable>();
    }
}