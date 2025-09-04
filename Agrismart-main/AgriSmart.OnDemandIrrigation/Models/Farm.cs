namespace AgriSmart.OnDemandIrrigation.Models
{
    public record Farm
    {
        public int Id { get; set; }
        public int CompanyId { get; set; }
        public string? Name { get; set; }
        public string? Description { get; set; }
        public bool Active { get; set; }
    }
}
