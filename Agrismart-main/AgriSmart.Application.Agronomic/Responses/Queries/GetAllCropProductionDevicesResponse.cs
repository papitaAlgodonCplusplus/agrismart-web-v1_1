using AgriSmart.Core.Entities;

namespace AgriSmart.Application.Agronomic.Responses.Queries
{
    public record GetAllCropProductionDevicesResponse
    {
        public IReadOnlyList<CropProductionDevice>? CropProductionDevices { get; set; } = new List<CropProductionDevice>();
    }
}