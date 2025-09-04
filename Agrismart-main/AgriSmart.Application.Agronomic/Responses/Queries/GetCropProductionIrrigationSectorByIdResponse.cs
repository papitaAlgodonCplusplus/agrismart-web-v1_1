using AgriSmart.Core.Entities;

namespace AgriSmart.Application.Agronomic.Responses.Queries
{
    public record GetCropProductionIrrigationSectorByIdResponse
    {
        public CropProductionIrrigationSector? CropProductionIrrigationSector { get; set; } = new CropProductionIrrigationSector();
    }
}
