using AgriSmart.Calculator.Models;

namespace AgriSmart.Calculator.Services.Responses
{
    public record GetAllCropsResponse
    {
        public IReadOnlyList<Crop>? Crops { get; set; }
    }
}
