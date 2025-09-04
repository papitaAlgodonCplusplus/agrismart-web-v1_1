using AgriSmart.Calculator.Entities.Base;
using AgriSmart.Core.Entities;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace AgriSmart.Calculator.Entities
{
    public class ProductionUnitEntity: BaseCalculationEntity
    {
        public FarmEntity Farm { get; set; }
        public int ProductionUnitType { get; set; }
        public string Description { get; set; }
        public string Polygon { get; set; }
        public bool Active { get; set; }

        public ProductionUnitEntity(ProductionUnit productionUnitModel, Farm farm)
        {
            Id = productionUnitModel.Id;
            Farm = new FarmEntity(farm);
            ProductionUnitType = productionUnitModel.ProductionUnitTypeId;
            Name = productionUnitModel.Name;
            Description = productionUnitModel.Description;
            //Polygon = productionUnitModel.Polygon;
            Active = productionUnitModel.Active;
        }
    }
}
