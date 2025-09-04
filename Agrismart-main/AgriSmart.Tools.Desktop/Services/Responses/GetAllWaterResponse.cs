using AgriSmart.Tools.DataModels;
using System.Collections.Generic;

namespace AgriSmart.Tools.Services.Responses
{
    public record GetAllWaterResponse
    {
        public List<WaterModel>? Waters { get; set; }
    }
}
