namespace AgriSmart.Core.Entities
{
    public class ProductionUnit : BaseEntity
    {
        public int FarmId { get; set; }
        public int ProductionUnitTypeId { get; set; }
        public string? Name { get; set; }
        public string? Description { get; set; }
       // public SqlGeography? Polygon { get; set; }
        public bool Active { get; set; }
    }
}