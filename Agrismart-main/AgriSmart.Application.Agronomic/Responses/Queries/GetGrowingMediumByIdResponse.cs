using AgriSmart.Core.Entities;

namespace AgriSmart.Application.Agronomic.Responses.Queries
{
    public record GetGrowingMediumByIdResponse
    {
        public GrowingMedium? GrowingMedium { get; set; } = new GrowingMedium();
    }
}
