using AgriSmart.Calculator.Entities.Base;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace AgriSmart.Calculator.Entities
{
    public class DropperEntity: BaseCalculationEntity
    {
        public double FlowRate { get; set; } //litres/hour
    }
}
