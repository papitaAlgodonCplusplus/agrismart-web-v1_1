using AgriSmart.Core.Entities;

namespace AgriSmart.Application.Agronomic.Responses.Queries
{
    public record GetAllCalculationSettingsResponse
    {
        public IReadOnlyList<CalculationSetting>? CalculationSettings { get; set; } = new List<CalculationSetting>();
    }
}