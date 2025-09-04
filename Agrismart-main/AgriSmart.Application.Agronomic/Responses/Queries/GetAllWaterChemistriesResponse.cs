using AgriSmart.Core.Entities;

namespace AgriSmart.Application.Agronomic.Responses.Queries
{
    public record GetAllWaterChemistriesResponse
    {
        public IReadOnlyList<WaterChemistry>? WaterChemistries { get; set; } = new List<WaterChemistry>();
    }
}