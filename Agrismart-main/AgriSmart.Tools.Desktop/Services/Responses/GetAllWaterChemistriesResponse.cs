using AgriSmart.Tools.DataModels;
using System.Collections.Generic;

namespace AgriSmart.Tools.Services.Responses
{
    public record GetAllWaterChemistriesResponse
    {
        public List<WaterChemistryModel>? WaterChemistries { get; set; }
    }
}
