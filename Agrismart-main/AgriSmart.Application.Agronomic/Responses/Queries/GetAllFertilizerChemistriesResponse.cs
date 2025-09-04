using AgriSmart.Core.Entities;

namespace AgriSmart.Application.Agronomic.Responses.Queries
{
    public record GetAllFertilizerChemistriesResponse
    {
        public IReadOnlyList<FertilizerChemistry>? FertilizerChemistries { get; set; } = new List<FertilizerChemistry>();
    }
}
