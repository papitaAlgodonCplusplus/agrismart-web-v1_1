using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace AgriSmart.Tools.Entities
{
    public class IrrigationHeadInput
    {
        public int NumberOfPumps { get; set; }
        public int NumberOfFilters { get; set; }
        public int NumberOfInjectors { get; set; }
        public int NumberOfManometers { get; set; }
        public int NumberOfElectroValves { get; set; }
        public int NumberOfAireValves { get; set; }

        public double FilterPresureLoss { get; set; }
        public double InjectorPresureLoss { get; set; }
        public double ManometerPresureLoss { get; set; }
        public double ElectroValvesPresureLoss { get; set; }
        public double AireValvesPresureLoss { get; set; }

    }
}
