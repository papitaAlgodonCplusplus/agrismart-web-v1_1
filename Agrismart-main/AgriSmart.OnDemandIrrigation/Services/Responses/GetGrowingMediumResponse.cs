using AgriSmart.OnDemandIrrigation.Models;

namespace AgriSmart.OnDemandIrrigation.Services.Responses
{
    public record GetGrowingMediumResponse
    {
        public GrowingMedium? GrowingMedium { get; set; } = new GrowingMedium();
    }
}
