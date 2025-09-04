using AgriSmart.AgronomicProcess.Models;
using TimeZone = AgriSmart.AgronomicProcess.Models.TimeZone;

namespace AgriSmart.AgronomicProcess.Services.Responses
{
    public record GetTimeZoneResponse
    {
        public TimeZone TimeZone { get; set; }
    }
}
