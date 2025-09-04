using AgriSmart.AgronomicProcess.Models;
using TimeZone = AgriSmart.AgronomicProcess.Models.TimeZone;

namespace AgriSmart.AgronomicProcess.Services.Responses
{
    public record GetAllTimeZonesResponse
    {
        public IReadOnlyList<TimeZone>? TimeZones { get; set; }
    }
}
