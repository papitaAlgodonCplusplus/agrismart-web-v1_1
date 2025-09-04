using AgriSmart.AgronomicProcess.Models;

namespace AgriSmart.AgronomicProcess.Services.Responses
{
    public record GetCropResponse
    {
        public Crop? Crop { get; set; }
    }
}
