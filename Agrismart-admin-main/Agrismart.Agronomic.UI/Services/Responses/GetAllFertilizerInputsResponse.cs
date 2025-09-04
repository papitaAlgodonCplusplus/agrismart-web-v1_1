using Agrismart.Agronomic.UI.Services.Models;

namespace Agrismart.Agronomic.UI.Services.Responses
{
    public record GetAllFertilizerInputsResponse
    {
        public IReadOnlyList<FertilizerInput>? FertilizerInputs { get; set; } = new List<FertilizerInput>();
    }
}