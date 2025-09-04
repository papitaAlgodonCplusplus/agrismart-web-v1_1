using AgriSmart.Calculator.Models;

namespace AgriSmart.Calculator.Services.Responses
{
    public record GetAllCropProductionsResponse
    {
        public IReadOnlyList<CropProduction>? CropProductions { get; set; }
    }
}
