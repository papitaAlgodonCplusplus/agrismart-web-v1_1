namespace AgriSmart.AgronomicProcess.Models
{
    public record Farm
    {
        public int Id { get; set; }
        public int CompanyId { get; set; }
        public Company Company { get; set; }
        public string? Name { get; set; }
        public string? Description { get; set; }
        public int TimeZoneId { get; set; }
        //public string TimeZoneName { get; set; }
        public bool Active { get; set; }

        public IList<ProductionUnit>? ProductionUnits { get; set; }
    }
}
