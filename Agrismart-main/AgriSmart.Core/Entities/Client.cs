namespace AgriSmart.Core.Entities
{
    public class Client : BaseEntity
    {
        public string? Name { get; set; }
        public string? Description { get; set; }
        public bool? Active { get; set; }
    }
}