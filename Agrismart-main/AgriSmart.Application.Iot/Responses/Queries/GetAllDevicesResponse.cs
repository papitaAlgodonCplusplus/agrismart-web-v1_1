using AgriSmart.Core.Entities;

namespace AgriSmart.Application.Iot.Responses.Queries
{
    public record GetAllDevicesResponse
    {
        public IReadOnlyList<Device>? Devices { get; set; } = new List<Device>();
    }
}
