using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace AgriSmart.Calculator.Entities
{
    public class TimeSpanMetricStat
    {
        public TimeSpan Average { get; set; }
        public TimeSpan Min { get; set; }
        public TimeSpan Max { get; set; }
        public TimeSpan Sum { get; set; }
    }
}
