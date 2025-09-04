using AgriSmart.Core.Entities;

namespace AgriSmart.Application.Agronomic.Responses.Queries
{
    public record GetFertilizerInputByIdResponse
    {
        public FertilizerInput ? FertilizerInput { get; set; } = new FertilizerInput();
    }
}
