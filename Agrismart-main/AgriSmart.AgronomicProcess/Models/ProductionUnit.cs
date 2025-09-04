namespace AgriSmart.AgronomicProcess.Models
{
    public record ProductionUnit
    {
        public int Id { get; set; }
        public int FarmId { get; set; }
        public Farm Farm { get; set; }
        public int ProductionUnitTypeId { get; set; }
        public string? Name { get; set; }
        public string? Description { get; set; }
        public bool Active { get; set; }
        public IList<CropProduction> CropProductions { get; set; }
    }
}
