using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace AgriSmart.Tools.DataModels
{
    public class GrowingMediumModel: BaseModel
    {
        public int CatalogId { get; set; }
        public double ContainerCapacityPercentage { get; set; }
        public double PermanentWiltingPoint { get; set; }
        public double FiveKpaHumidity { get; set; }//not in DB
        public double ApparentDensity { get; set; }//not in DB
        public double ActualDensity { get; set; }//not in DB
        public double DepletionPercentage { get; set; }//not in DB

    }
}
