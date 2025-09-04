using AgriSmart.Core.Entities;

namespace AgriSmart.Application.Agronomic.Responses.Queries
{
    public record GetFertilizerChemistryByIdResponse
    {
        public FertilizerChemistry ? FertilizerChemistry { get; set; } = new FertilizerChemistry();
    }
}
