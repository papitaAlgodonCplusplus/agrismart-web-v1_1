using Agrismart.Agronomic.UI.Services.Models;

namespace Agrismart.Agronomic.UI.Services.Responses
{
    public record GetAllDevicesResponse
    {
        public IReadOnlyList<Device>? Devices { get; set; } = new List<Device>();
    }
}