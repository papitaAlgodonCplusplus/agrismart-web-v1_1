using AgriSmart.Core.Entities;

namespace AgriSmart.Application.Agronomic.Commands
{
    public record CalculateCropProductionMeasurementsCommand
    {
        public CropProduction CropProduction { get; set; }
    }
}
