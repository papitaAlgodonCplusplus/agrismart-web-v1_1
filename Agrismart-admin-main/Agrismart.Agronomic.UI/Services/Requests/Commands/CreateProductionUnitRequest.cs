namespace Agrismart.Agronomic.UI.Services.Requests.Commands
{
    public record CreateProductionUnitRequest
    {
        public int FarmId { get; set; }
        public int ProductionUnitTypeId { get; set; }
        public string? Name { get; set; }
        public string? Description { get; set; }
    }
}
