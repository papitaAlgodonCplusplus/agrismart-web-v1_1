using AgriSmart.Tools.DataModels;
using System.Collections.Generic;

namespace AgriSmart.Tools.Services.Responses
{
    public record GetAllCropProductionsResponse
    {
        public List<CropProductionModel>? CropProductions { get; set; }
    }
}
