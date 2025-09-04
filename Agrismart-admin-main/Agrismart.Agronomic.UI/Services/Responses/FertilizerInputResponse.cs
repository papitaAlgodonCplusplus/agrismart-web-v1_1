namespace Agrismart.Agronomic.UI.Services.Responses
{
    public record FertilizerInputResponse
    {
        public int Id { get; set; }
        public int CatalogId { get; set; }
        public int InputPresentationId { get; set; }
        public int FertilizerId { get; set; }
        public string? Name { get; set; }
        public decimal Price { get; set; }
        public bool Active { get; set; }
    }
}