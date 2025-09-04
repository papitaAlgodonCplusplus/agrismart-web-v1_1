using AgriSmart.Tools.DataModels;
using System.Collections.Generic;

namespace AgriSmart.Tools.Services.Responses
{
    public record GetAllFertilizerChemitriesResponse
    {
        public List<FertilizerChemistryModel>? FertilizerChemistries { get; set; }
    }
}
