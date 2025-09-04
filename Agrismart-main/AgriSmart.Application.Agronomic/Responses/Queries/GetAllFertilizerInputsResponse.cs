using AgriSmart.Core.Entities;

namespace AgriSmart.Application.Agronomic.Responses.Queries
{
    public record GetAllFertilizerInputsResponse
    {
        public IReadOnlyList<FertilizerInput>? FertilizerInputs { get; set; } = new List<FertilizerInput>();
    }
}
