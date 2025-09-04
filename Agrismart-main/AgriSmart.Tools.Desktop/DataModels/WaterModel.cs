using AgriSmart.Tools.DataModels;
using AgriSmart.Tools.Entities;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace AgriSmart.Tools.DataModels
{
    public class WaterModel: BaseModel
    {
        public int CatalogsId { get; set; }

        public WaterModel()
        {
        }

        public WaterModel(WaterEntity water)
        {
            this.CopyPropertiesFrom(water);
        }
    }
}
