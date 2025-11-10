namespace AgriSmart.Core.Entities
{
    public class Catalog : BaseEntity
    {
        public int ClientId { get; set; }
        public string? Name { get; set; }
        public bool? Active { get; set; }

        public Catalog()
        {
            Active = true; // Default to active when creating new catalogs
        }
    }
}