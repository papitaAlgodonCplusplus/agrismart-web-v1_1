using AgriSmart.Tools.DataModels;
using System.Collections.Generic;

namespace AgriSmart.Tools.Services.Responses
{
    public record GetAllFertilizersResponse
    {
        public List<FertilizerModel>? Fertilizers { get; set; }
    }
}
