using AgriSmart.AgronomicProcess.Models;

namespace AgriSmart.AgronomicProcess.Services.Responses
{
    public record GetAllCropProductionsResponse
    {
        public IReadOnlyList<CropProduction>? CropProductions { get; set; }
    }
}
