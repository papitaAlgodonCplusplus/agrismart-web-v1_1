namespace AgriSmart.Calculator.Models
{
    public record CropProductionIrrigationSector
    {
        public int CropProductionId { get; set; }
        public string? Name { get; set; }
        public int PumpRelayId { get; set; }
        public int ValveRelayId { get; set; }
        public string? Polygon { get; set; }
        public bool Active { get; set; }
    }
}