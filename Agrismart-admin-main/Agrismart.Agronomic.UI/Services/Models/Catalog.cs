namespace Agrismart.Agronomic.UI.Services.Models
{
    public class Catalog
    {
        public int Id { get; set; }
        public int ClientId { get; set; }
        public string? Name { get; set; }
        public bool Active { get; set; }
        public DateTime? DateCreated { get; set; }
        public DateTime? DateUpdated { get; set; }
        public int? CreatedBy { get; set; }
        public int? UpdatedBy { get; set; }
    }
}