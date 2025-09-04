using AgriSmart.Core.Entities;

namespace AgriSmart.Application.Agronomic.Responses.Queries
{
    public record GetWaterChemistryByIdResponse
    {
        public WaterChemistry? WaterChemistry { get; set; } = new WaterChemistry();
    }
}