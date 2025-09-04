using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace AgriSmart.Tools.DataModels
{
    public class ProductionUnitModel: BaseModel
    {
        public int FarmId { get; set; }
        public int ProductionUnitType { get; set; }
        public string Description { get; set; }
        public string Polygon { get; set; }

    }
}
