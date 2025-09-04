using TimeZone = AgriSmart.Core.Entities.TimeZone;

namespace AgriSmart.Application.Agronomic.Responses.Queries
{
    public record GetAllTimeZonesResponse
    {
        public IReadOnlyList<TimeZone>? TimeZones { get; set; } = new List<TimeZone>();
    }
}