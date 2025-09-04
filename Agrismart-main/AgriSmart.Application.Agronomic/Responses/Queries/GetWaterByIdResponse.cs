using AgriSmart.Core.Entities;

namespace AgriSmart.Application.Agronomic.Responses.Queries
{
    public record GetWaterByIdResponse
    {
        public Water ? Water { get; set; } = new Water();
    }
}