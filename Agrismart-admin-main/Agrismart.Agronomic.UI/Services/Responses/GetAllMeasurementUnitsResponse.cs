using Agrismart.Agronomic.UI.Services.Models;

namespace Agrismart.Agronomic.UI.Services.Responses
{
    public record GetAllMeasurementUnitsResponse
    {
        public IReadOnlyList<MeasurementUnit>? MeasurementUnits { get; set; } = new List<MeasurementUnit>();
    }
}