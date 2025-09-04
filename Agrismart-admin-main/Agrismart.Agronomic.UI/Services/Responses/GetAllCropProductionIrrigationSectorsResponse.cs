using Agrismart.Agronomic.UI.Services.Models;

namespace Agrismart.Agronomic.UI.Services.Responses
{
    public record GetAllCropProductionIrrigationSectorsResponse
    {
        public IReadOnlyList<CropProductionIrrigationSector>? CropProductionIrrigationSectors { get; set; } = new List<CropProductionIrrigationSector>();
    }
}
