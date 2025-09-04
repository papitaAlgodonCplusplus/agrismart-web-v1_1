using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace AgriSmart.Calculator.Entities
{
    public class IrrigationMetric
    {
        public DateTime Date { get; set; }
        public TimeSpan IrrigationInterval { get; set; }
        public TimeSpan IrrigationLength { get; set; }
        public Volume IrrigationVolumenTotal { get; set; }
        public Volume IrrigationVolumenM2 { get; set; }
        public Volume IrrigationVolumenPerPlant { get; set; }
        public Volume DrainVolumenM2 { get; set; }
        public Volume DrainVolumenPerPlant { get; set; }
        public double DrainPercentage { get; set; }
        public Volume IrrigationFlow { get; set; }
        public Volume IrrigationPrecipitation { get; set; }
        public int CropProductionId { get; set; }


    }
}
