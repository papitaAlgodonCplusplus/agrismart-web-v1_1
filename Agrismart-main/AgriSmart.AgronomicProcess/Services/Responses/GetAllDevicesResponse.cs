using AgriSmart.AgronomicProcess.Models;

namespace AgriSmart.AgronomicProcess.Services.Responses
{
    public record GetAllDevicesResponse
    {
        public IReadOnlyList<Device>? Devices { get; set; }
    }
}
