using AgriSmart.AgronomicProcess.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace AgriSmart.AgronomicProcess.Services.Responses
{
    public record ProcessCropProductionIrrigationEventsResponse
    {
        public IList<IrrigationEvent> IrrigationEvents { get; set; }
    }
}
