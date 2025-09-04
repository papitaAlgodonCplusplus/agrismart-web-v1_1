using AgriSmart.Core.Entities;
using System.Collections.Generic;

namespace AgriSmart.Tools.Entities
{
    public class ProductionUnitEntity: BaseEntity
    {
        public FarmEntity Farm { get; set; }
        public int ProductionUnitType { get; set; }
        public string Description { get; set; }
        public string Polygon { get; set; }
        public bool Active { get; set; }
        public List<CropProductionEntity> CropProductions { get; set; } = new List<CropProductionEntity>();

        public ProductionUnitEntity(ProductionUnit model, FarmEntity farm)
        {
            this.CopyPropertiesFrom(model);
            this.Farm = farm;
        }
    }
}
