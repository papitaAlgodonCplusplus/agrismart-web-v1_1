namespace AgriSmart.Core.Entities
{
    public class Farm : BaseEntity
    {
        public int CompanyId { get; set; }       
        public string? Name { get; set; }
        public string? Description { get; set; }
        public int TimeZoneId {  get; set; }
        //public DbGeography? Polygon { get; set; }
        public bool Active { get; set; }
    }
}