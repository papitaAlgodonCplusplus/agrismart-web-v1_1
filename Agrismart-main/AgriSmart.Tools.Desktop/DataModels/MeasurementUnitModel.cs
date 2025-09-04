using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace AgriSmart.Tools.DataModels
{
    public class MeasurementUnitModel : BaseModel
    {
        public string Symbol { get; set; }
        public int MeasureType { get; set; }
        public int BaseMeasureUnitId { get; set; }
        public double ConvertionFactorToBase { get; set; }
    }
}
