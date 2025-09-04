using AgriSmart.OnDemandIrrigation.Models;

namespace AgriSmart.OnDemandIrrigation.Services.Responses
{
    public record GetAllCropsResponse
    {
        public IReadOnlyList<Crop>? Crops { get; set; }
    }
}
