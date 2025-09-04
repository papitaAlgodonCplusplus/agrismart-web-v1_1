using AgriSmart.OnDemandIrrigation.Models;

namespace AgriSmart.OnDemandIrrigation.Services.Responses
{
    public record GetAllCropProductionsResponse
    {
        public IReadOnlyList<CropProduction>? CropProductions { get; set; }
    }
}
