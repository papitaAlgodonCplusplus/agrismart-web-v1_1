using AgriSmart.Core.Entities;

namespace AgriSmart.Application.Agronomic.Responses.Queries
{
    public record GetMeasurementVariableByIdResponse
    {
        public MeasurementVariable ? MeasurementVariable { get; set; } = new MeasurementVariable();
    }
}
