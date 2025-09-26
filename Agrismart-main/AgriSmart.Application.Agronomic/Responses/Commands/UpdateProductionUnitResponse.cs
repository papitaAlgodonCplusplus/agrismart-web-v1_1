namespace AgriSmart.Application.Agronomic.Responses.Commands
{
    public record UpdateProductionUnitResponse
    {
        public int Id { get; set; }
        public int FarmId { get; set; }
        public int ProductionUnitTypeId { get; set; }
        public string? Name { get; set; }
        public string? Description { get; set; }
        public bool? Active { get; set; }
    }
}
