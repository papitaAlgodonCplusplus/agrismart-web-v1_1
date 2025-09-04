using AgriSmart.OnDemandIrrigation.Models;

namespace AgriSmart.OnDemandIrrigation.Entities
{
    public record CropProductionIrrigationSectorEntity
    {
        public int CropProductionId { get; set; }
        public string? Name { get; set; }
        public Relay? PumpRelay { get; set; }
        public Relay? ValveRelay { get; set; }
        public string? Polygon { get; set; }
        public bool Active { get; set; }
    }
}