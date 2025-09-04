using AgriSmart.AgronomicProcess.Models;
using AgriSmart.Tools.DataModels;

namespace AgriSmart.Tools.Services.Responses
{
    public record GetCropResponse
    {
        public CropModel? Crop { get; set; }
    }
}
