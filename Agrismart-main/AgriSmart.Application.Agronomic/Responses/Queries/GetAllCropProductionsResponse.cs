using AgriSmart.Core.Entities;

namespace AgriSmart.Application.Agronomic.Responses.Queries
{
    public record GetAllCropProductionsResponse
    {
        public IReadOnlyList<CropProduction>? CropProductions { get; set; } = new List<CropProduction>();
    }
}
