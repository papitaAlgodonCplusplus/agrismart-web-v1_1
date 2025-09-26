namespace AgriSmart.Core.Entities
{
    public class FertilizerInput : BaseEntity
    {
        public int CatalogId { get; set; }
        public int InputPresentationId { get; set; }
        public int FertilizerId { get; set; }
        public string? Name { get; set; }
        public decimal Price { get; set; }
        public bool? Active { get; set; }
    }
}