using AgriSmart.Calculator.Models;

namespace AgriSmart.Calculator.Services.Responses
{
    public record GetCropProductionIrrigationSectorResponse
    {
        public CropProductionIrrigationSector? CropProductionIrrigationSector { get; set; }
    }
}
