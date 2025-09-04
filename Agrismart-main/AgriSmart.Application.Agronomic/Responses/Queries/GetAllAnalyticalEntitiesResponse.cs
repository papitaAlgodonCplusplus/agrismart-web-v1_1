using AgriSmart.Core.Entities;

namespace AgriSmart.Application.Agronomic.Responses.Queries
{
    public record GetAllAnalyticalEntitiesResponse
    {
        public IReadOnlyList<AnalyticalEntity>? AnaliticalEntities { get; set; } = new List<AnalyticalEntity>();
    }
}
