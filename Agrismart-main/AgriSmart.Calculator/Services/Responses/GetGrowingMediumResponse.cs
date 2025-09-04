using AgriSmart.Calculator.Models;

namespace AgriSmart.Calculator.Services.Responses
{
    public record GetGrowingMediumResponse
    {
        public GrowingMedium? GrowingMedium { get; set; } = new GrowingMedium();
    }
}
