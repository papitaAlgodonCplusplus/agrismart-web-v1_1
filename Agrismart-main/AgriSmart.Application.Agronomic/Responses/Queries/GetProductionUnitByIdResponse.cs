using AgriSmart.Core.Entities;

namespace AgriSmart.Application.Agronomic.Responses.Queries
{
    public record GetProductionUnitByIdResponse
    {
        public ProductionUnit ? ProductionUnit { get; set; } = new ProductionUnit();
    }
}
