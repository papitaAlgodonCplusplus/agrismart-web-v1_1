using AgriSmart.AgronomicProcess.Models;

namespace AgriSmart.AgronomicProcess.Services.Responses
{
    public record GetAllCalculationSettingsResponse
    {
        public IReadOnlyList<CalculationSetting>? CalculationSettings { get; set; }
    }
}
