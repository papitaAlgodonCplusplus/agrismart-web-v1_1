using AgriSmart.Tools.DataModels;
using System.Collections.Generic;

namespace AgriSmart.Tools.Services.Responses
{
    public record GetAllCalculationSettingsResponse
    {
        public List<CalculationSettingModel>? CalculationSettings { get; set; }
    }
}
