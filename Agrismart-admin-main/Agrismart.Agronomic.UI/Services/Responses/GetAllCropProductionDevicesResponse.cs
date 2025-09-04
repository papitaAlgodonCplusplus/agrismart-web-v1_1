using Agrismart.Agronomic.UI.Services.Models;

namespace Agrismart.Agronomic.UI.Services.Responses
{
    public record GetAllCropProductionDevicesResponse
    {
        public IReadOnlyList<CropProductionDevice>? CropProductionDevices { get; set; } = new List<CropProductionDevice>();
    }
}