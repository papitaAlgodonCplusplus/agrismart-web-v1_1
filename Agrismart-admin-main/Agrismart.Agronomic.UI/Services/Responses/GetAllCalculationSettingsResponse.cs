using Agrismart.Agronomic.UI.Services.Models;

namespace Agrismart.Agronomic.UI.Services.Responses
{
    public record GetAllCalculationSettingsResponse
    {
        public IReadOnlyList<CalculationSetting>? CalculationSettings { get; set; } = new List<CalculationSetting>();
    }
}