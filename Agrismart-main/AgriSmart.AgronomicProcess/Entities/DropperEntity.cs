using AgriSmart.AgronomicProcess.Models;

namespace AgriSmart.AgronomicProcess.Entities
{
    public class DropperEntity
    {
        public int CatalogId { get; set; }
        public string? Name { get; set; }
        public double  FlowRate { get; set; }
        public bool Active { get; set; }
        public DropperEntity(Dropper model)
        {
            this.CopyPropertiesFrom(model);
        }
    }
}