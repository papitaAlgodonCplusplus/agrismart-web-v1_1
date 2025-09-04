using AgriSmart.Core.Entities;

namespace AgriSmart.Application.Agronomic.Responses.Queries
{
    public record GetCalculationSettingByIdResponse
    {
        public CalculationSetting? CalculationSetting { get; set; } = new CalculationSetting();
    }
}