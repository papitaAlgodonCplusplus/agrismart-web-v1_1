namespace Agrismart.Agronomic.UI.Services.Responses
{
    public record DropperResponse
    {
        public int Id { get; set; }
        public int CropProductionId { get; set; }
        public string? Name { get; set; }
        public bool Active { get; set; }
    }
}
