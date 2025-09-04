using TimeZone = AgriSmart.Core.Entities.TimeZone;

namespace AgriSmart.Application.Agronomic.Responses.Queries
{
    public record GetTimeZoneByIdResponse
    {
        public TimeZone? TimeZone { get; set; }
    }
}