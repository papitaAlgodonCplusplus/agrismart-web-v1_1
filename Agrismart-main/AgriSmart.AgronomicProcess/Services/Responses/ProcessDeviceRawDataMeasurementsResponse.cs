using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace AgriSmart.AgronomicProcess.Services.Responses
{
    public record ProcessDeviceRawDataMeasurementsResponse
    {
        public int TotalMeasurements { get; set; }
    }
}
