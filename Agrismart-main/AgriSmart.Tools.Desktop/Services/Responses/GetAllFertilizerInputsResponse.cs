using AgriSmart.Tools.DataModels;
using System.Collections.Generic;

namespace AgriSmart.Tools.Services.Responses
{
    public record GetAllFertilizerInputsResponse
    {
        public List<FertilizerInputModel>? FertilizerInputs { get; set; }
    }
}
