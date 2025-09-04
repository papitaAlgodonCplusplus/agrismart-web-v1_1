using AgriSmart.Calculator.Models;

namespace AgriSmart.Calculator.Services.Responses
{
    public record GetAllDevicesResponse
    {
        public IReadOnlyList<Device>? Devices { get; set; }
    }
}
