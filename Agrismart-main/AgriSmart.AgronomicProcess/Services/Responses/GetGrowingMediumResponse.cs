using AgriSmart.AgronomicProcess.Models;

namespace AgriSmart.AgronomicProcess.Services.Responses
{
    public record GetGrowingMediumResponse
    {
        public GrowingMedium? GrowingMedium { get; set; } = new GrowingMedium();
    }
}
