using AgriSmart.AgronomicProcess.Entities;
using AgriSmart.AgronomicProcess.Models;

namespace AgriSmart.AgronomicProcess.Entities
{
    public record ProductionUnitEntity
    {
        public int Id { get; set; }
        public int FarmId { get; set; }
        public Farm Farm { get; set; }
        public int ProductionUnitTypeId { get; set; }
        public string? Name { get; set; }
        public string? Description { get; set; }
        public bool Active { get; set; }
        public IList<CropProductionEntity>? CropProductions { get; set; }

        public ProductionUnitEntity(ProductionUnit model)
        {
            this.CopyPropertiesFrom(model);
        }
    }
}
