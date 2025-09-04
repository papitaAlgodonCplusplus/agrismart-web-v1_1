using AgriSmart.Core.Entities;

namespace AgriSmart.Application.Agronomic.Responses.Queries
{
    public record GetAllMeasurementVariableStandardsResponse
    {
        public IReadOnlyList<MeasurementVariableStandard>? MeasurementVariableStandards { get; set; } = new List<MeasurementVariableStandard>();
    }
}
