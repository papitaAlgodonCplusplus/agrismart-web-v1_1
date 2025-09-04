namespace Agrismart.Agronomic.UI.Services.Requests.Commands
{
    public record CreateFertilizerInputRequest
    {
        public int CatalogId { get; set; }
        public int InputPresentationId { get; set; }
        public int FertilizerId { get; set; }
        public string? Name { get; set; }
        public decimal Price { get; set; }
    }
}