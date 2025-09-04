using AgriSmart.Core.Entities;

namespace AgriSmart.Application.Agronomic.Responses.Queries
{
    public record GetAllCropProductionIrrigationSectorsResponse
    {
        public IReadOnlyList<CropProductionIrrigationSector>? CropProductionIrrigationSectors { get; set; } = new List<CropProductionIrrigationSector>();
    }
}
