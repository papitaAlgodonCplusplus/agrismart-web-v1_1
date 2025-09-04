namespace Agrismart.Agronomic.UI.Services.Requests.Commands
{
    public record CreateGrowingMediumRequest
    {
        public int CatalogId { get; set; }
        public string? Name { get; set; }
        public double ContainerCapacityPercentage { get; set; }
        public double PermanentWiltingPoint { get; set; }
    }
}
