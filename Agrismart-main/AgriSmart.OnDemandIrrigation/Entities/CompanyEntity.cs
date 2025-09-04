namespace AgriSmart.OnDemandIrrigation.Entities
{
    public record CompanyEntity
    {
        public int Id { get; set; }
        public int ClientId { get; set; }
        public int CatalogId { get; set; }
        public string? DeviceUser { get; set; }
        public string? Name { get; set; }
        public string? Description { get; set; }
        public bool Active { get; set; }
        public IList<FarmEntity>? Farms { get; set; }
    }
}
