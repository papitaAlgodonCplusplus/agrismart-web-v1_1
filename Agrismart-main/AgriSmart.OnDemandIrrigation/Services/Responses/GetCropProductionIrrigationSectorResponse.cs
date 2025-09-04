using AgriSmart.OnDemandIrrigation.Models;

namespace AgriSmart.OnDemandIrrigation.Services.Responses
{
    public record GetCropProductionIrrigationSectorResponse
    {
        public CropProductionIrrigationSector? CropProductionIrrigationSector { get; set; }
    }
}
