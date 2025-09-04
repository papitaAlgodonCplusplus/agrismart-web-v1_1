using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace AgriSmart.Tools.Entities
{
    public class IrrigationHead: BaseEntity
    {
        public List<IrrigationHeadPump> Pumps { get; set; }
        public List<IrrigationHeadFilter> Filters { get; set; }
        public List<IrrigationHeadInjector> Injectors { get; set; }
        public List<IrrigationHeadManometer> Manometers { get; set; }
        public List<IrrigationHeadElectroValve> ElectroValves { get; set; }
        public List<IrrigationHeadAirValve> AireValves { get; set; }

        public IrrigationHead(IrrigationHeadInput input)
        {
            Pumps = new List<IrrigationHeadPump>();

            for (int i = 0; i < input.NumberOfPumps; i++)
            {
                IrrigationHeadPump newPump = new IrrigationHeadPump();
                Pumps.Add(newPump);
            }

            Filters = new List<IrrigationHeadFilter>();

            for (int i = 0; i < input.NumberOfFilters; i++)
            {
                IrrigationHeadFilter newFilter = new IrrigationHeadFilter();
                newFilter.PressureLoss = input.FilterPresureLoss;
                Filters.Add(newFilter);
            }

        }
    }
}
