using AgriSmart.Core.Entities;
using System.Collections.Generic;

namespace AgriSmart.Tools.Entities
{
    public class FarmEntity: BaseEntity
    {
        public CompanyEntity Company { get; set; }
        public string Description { get; set; }
        public string Polygon { get; set; }
        public bool Active { get; set; }
        public List<ProductionUnitEntity> ProductionUnits { get; set; }   = new List<ProductionUnitEntity>();

        public FarmEntity(Farm model, CompanyEntity company)
        {
            this.CopyPropertiesFrom(model);
        }
    }
}
