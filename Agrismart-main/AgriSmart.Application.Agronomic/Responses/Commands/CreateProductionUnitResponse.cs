namespace AgriSmart.Application.Agronomic.Responses.Commands
{
    public record CreateProductionUnitResponse
    {
        public int Id { get; set; }
        public int FarmId { get; set; }
        public int ProductionUnitTypeId { get; set; }
        public string? Name { get; set; }
        public string? Description { get; set; }
        public string? Location { get; set; }
        public decimal? Area { get; set; }
        public int? Capacity { get; set; }
        public string? SoilType { get; set; }
        public string? Drainage { get; set; }
        public string? GreenhouseType { get; set; }
        public string? Ventilation { get; set; }
        public string? LightingSystem { get; set; }
        public bool Irrigation { get; set; }
        public bool ClimateControl { get; set; }
        public bool? Active { get; set; }
    }
}