namespace Agrismart.Agronomic.UI.Services.Requests.Commands
{
    public record UpdateContainerRequest
    {
        public int Id { get; set; }
        public int CatalogId { get; set; }
        public string? Name { get; set; }
        public int ContainerTypeId { get; set; }
        public double Height { get; set; }
        public double Width { get; set; }
        public double Length { get; set; }
        public double LowerDiameter { get; set; }
        public double UpperDiameter { get; set; }
        public bool Active { get; set; }
    }
}