using AgriSmart.OnDemandIrrigation.Models;

namespace AgriSmart.OnDemandIrrigation.Services.Responses
{
    public record GetCropResponse
    {
        public Crop? Crop { get; set; }
    }
}
