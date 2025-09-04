using AgriSmart.Tools.DataModels;
using System.Collections.Generic;

namespace AgriSmart.Tools.Services.Responses
{
    public record GetAllCropsResponse
    {
        public List<CropModel>? Crops { get; set; }
    }
}
