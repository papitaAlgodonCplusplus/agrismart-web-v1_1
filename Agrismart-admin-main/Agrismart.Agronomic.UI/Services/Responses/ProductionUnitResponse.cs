namespace Agrismart.Agronomic.UI.Services.Responses
{
    public record ProductionUnitResponse
    {
        public int Id { get; set; }
        public int ProductionUnitTypeId { get; set; }
        public string? Name { get; set; }
        public string? Description { get; set; }
    }
}