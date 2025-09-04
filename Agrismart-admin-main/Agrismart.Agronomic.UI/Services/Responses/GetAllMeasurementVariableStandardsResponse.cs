using Agrismart.Agronomic.UI.Services.Models;

namespace Agrismart.Agronomic.UI.Services.Responses
{
    public record GetAllMeasurementVariableStandardsResponse
    {
        public IReadOnlyList<MeasurementVariableStandard>? MeasurementVariableStandards { get; set; } = new List<MeasurementVariableStandard>();
    }
}