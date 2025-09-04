namespace Agrismart.Agronomic.UI.Services.Responses
{
    public record WaterResponse
    {
        public int Id { get; set; }
        public int CatalogId { get; set; }
        public string? Name { get; set; }
        public bool Active { get; set; }
    }
}