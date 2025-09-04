using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace AgriSmart.Tools.Entities
{
    public class SoilIrrigationDesignInput
    {
        // Crop Production Inputs
        public double Length { get; set; }
        public double Width { get; set; }
        public double BetweenRowDistance { get; set; }
        public double BetweenPlantDistance { get; set; }
        public List<SoilLayerEntity> SoilLayers { get; set; }
        public ContainerEntity Container { get; set; }


    }
}
