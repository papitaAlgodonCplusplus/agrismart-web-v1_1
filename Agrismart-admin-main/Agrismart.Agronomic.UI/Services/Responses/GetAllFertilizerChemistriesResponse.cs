using Agrismart.Agronomic.UI.Services.Models;

namespace Agrismart.Agronomic.UI.Services.Responses
{
    public record GetAllFertilizerChemistriesResponse
    {
        public IReadOnlyList<FertilizerChemistry>? FertilizerChemistries { get; set; } = new List<FertilizerChemistry>();
    }
}