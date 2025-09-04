using AgriSmart.Core.Entities;

namespace AgriSmart.Application.Iot.Responses.Commands
{
    public record AuthenticateDeviceResponse
    {
        public Company? Company { get; set; }
        public Device? Device { get; set; }
        public IEnumerable<Sensor>? Sensors { get; set; }
    }
}
