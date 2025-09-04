using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace AgriSmart.Calculator.Entities
{
    public class GrowingMediumMeasurementEntity
    {
        public DateTime Date { get; set; }
        public double VolumetricWaterContent { get; set; }
        public int CropProductionId { get; set; }

        public GrowingMediumMeasurementEntity()
        {
        }

        public GrowingMediumMeasurementEntity(DateTime date, double volumetricWaterContent, int cropProductionId)
        {
            Date = date;
            VolumetricWaterContent = volumetricWaterContent;
            CropProductionId = cropProductionId;
        }
    }
}
