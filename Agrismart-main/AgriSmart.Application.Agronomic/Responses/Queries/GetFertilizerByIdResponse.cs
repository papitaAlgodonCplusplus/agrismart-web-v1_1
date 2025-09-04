using AgriSmart.Core.Entities;

namespace AgriSmart.Application.Agronomic.Responses.Queries
{
    public record GetFertilizerByIdResponse
    {
        public Fertilizer ? Fertilizer { get; set; } = new Fertilizer();
    }
}
