using AgriSmart.Calculator.Models;

namespace AgriSmart.Calculator.Entities
{
    public class GrowingMediumMetric
    {
        public DateTime Date { get; set; }
        public double VolumetricWaterContent { get; set; }
        public CropProduction CropProduduction { get; set; }
    }
}
