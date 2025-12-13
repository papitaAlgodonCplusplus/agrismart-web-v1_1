using AgriSmart.Core.Entities;

namespace AgriSmart.Application.Agronomic.Responses.Queries
{
    public record GetAllCropProductionSpecsResponse
    {
        public IReadOnlyList<CropProductionSpecs>? CropProductionSpecs { get; set; } = new List<CropProductionSpecs>();
    }
}
