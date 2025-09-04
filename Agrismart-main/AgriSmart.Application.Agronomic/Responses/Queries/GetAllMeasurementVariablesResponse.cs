using AgriSmart.Core.Entities;

namespace AgriSmart.Application.Agronomic.Responses.Queries
{
    public record GetAllMeasurementVariablesResponse
    {
        public IReadOnlyList<MeasurementVariable>? MeasurementVariables { get; set; } = new List<MeasurementVariable>();
    }
}
