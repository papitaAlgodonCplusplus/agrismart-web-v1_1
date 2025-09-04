using AgriSmart.Core.Entities;

namespace AgriSmart.Application.Iot.Responses.Queries
{
    public record GetAllSensorsResponse
    {
        public IReadOnlyList<Sensor>? Sensors { get; set; } = new List<Sensor>();
    }
}
