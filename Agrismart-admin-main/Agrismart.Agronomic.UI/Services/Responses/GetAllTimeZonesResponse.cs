using TimeZone = Agrismart.Agronomic.UI.Services.Models.TimeZone;

namespace Agrismart.Agronomic.UI.Services.Responses
{
    public record GetAllTimeZonesResponse
    {
        public IReadOnlyList<TimeZone>? TimeZones { get; set; } = new List<TimeZone>();
    }
}
