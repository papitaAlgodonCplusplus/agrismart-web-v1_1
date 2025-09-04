using AgriSmart.Tools.DataModels;
using System.Collections.Generic;

namespace AgriSmart.Tools.Services.Responses
{
    public record GetAllFarmsResponse
    {
        public List<FarmModel>? Farms { get; set; }
    }
}
