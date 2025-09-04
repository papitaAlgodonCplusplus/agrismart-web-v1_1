using AgriSmart.Tools.DataModels;
using System.Collections.Generic;

namespace AgriSmart.Tools.Services.Responses
{
    public record GetAllCropPhasesResponse
    {
        public List<CropPhaseModel>? CropPhases { get; set; }
    }
}
