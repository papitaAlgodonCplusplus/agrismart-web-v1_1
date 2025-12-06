namespace AgriSmart.Core.Entities
{
    public class ProductionUnit : BaseEntity
    {
        public int FarmId { get; set; }
        public int ProductionUnitTypeId { get; set; }
        public string? Name { get; set; }
        public string? Description { get; set; }
        public string? Location { get; set; }
        public decimal? Area { get; set; } // Area in square meters
        public int? Capacity { get; set; } // Capacity in units
        public string? SoilType { get; set; }
        public string? Drainage { get; set; }
        public string? GreenhouseType { get; set; }
        public string? Ventilation { get; set; }
        public string? LightingSystem { get; set; }
        public bool Irrigation { get; set; } // Sistema de riego
        public bool ClimateControl { get; set; } // Control climático
       // public SqlGeography? Polygon { get; set; }
        public bool? Active { get; set; }
    }
}