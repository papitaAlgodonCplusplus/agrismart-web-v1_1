using AgriSmart.Calculator.Models;

namespace AgriSmart.Calculator.Services.Responses
{
    public record GetCropResponse
    {
        public Crop? Crop { get; set; }
    }
}
