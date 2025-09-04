using AgriSmart.Tools.DataModels;
using System.Collections.Generic;

namespace AgriSmart.Tools.Services.Responses
{
    public record GetCropPhaseSolutionRequirementResponse
    {
        public CropPhaseSolutionRequirementModel? CropPhaseSolutionRequirement { get; set; }
    }
}
