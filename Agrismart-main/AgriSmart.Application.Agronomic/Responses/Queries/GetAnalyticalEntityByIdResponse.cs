using AgriSmart.Core.Entities;

namespace AgriSmart.Application.Agronomic.Responses.Queries
{
    public record GetAnalyticalEntityByIdResponse
    {
        public AnalyticalEntity? AnaliticalEntity { get; set; } = new AnalyticalEntity();
    }
}
