namespace AgriSmart.OnDemandIrrigation.Entities
{
    public record FarmEntity
    {
        public int Id { get; set; }
        public int CompanyId { get; set; }
        public string? Name { get; set; }
        public string? Description { get; set; }
        public bool Active { get; set; }
        public IList<ProductionUnitEntity>? ProductionUnits { get; set; }
    }
}
