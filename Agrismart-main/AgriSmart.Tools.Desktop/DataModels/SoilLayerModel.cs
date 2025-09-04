using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace AgriSmart.Tools.DataModels
{
    public class SoilLayerModel
    {
        public int CatalogsId { get; set; }
        public double FieldCapacityPercentage { get; set; }
        public double PermanentWiltingPointPercentage { get; set; }
        public double SevenKpaHumidity { get; set; }
        public double ApparentDensity { get; set; }
        public double ActualDensity { get; set; }
        public double SoilDepth { get; set; }
        public double SandPercentage { get; set; }
        public double SiltPercentage { get; set; }
        public double ClayPercentage { get; set; }
        public double InfiltrationCapacity { get; set; }
        public double DepletionPercentage { get; set; }
        public double IrrigatedAreaPercentage { get; set; }
        public double IrrigationSheetNetVolume { get; set; }
        public double ApplicationEfficiency { get; set; }
    }
}
