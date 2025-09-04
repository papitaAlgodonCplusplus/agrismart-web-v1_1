using AgriSmart.OnDemandIrrigation.Entities;

namespace AgriSmart.Calculator.Models
{
    public record ClientEntity
    {
        public int Id { get; set; }
        public string? Name { get; set; }
        public string? Description { get; set; }
        public bool Active { get; set; }
        public IList<CompanyEntity>? Companies { get; set; }
    }
}
