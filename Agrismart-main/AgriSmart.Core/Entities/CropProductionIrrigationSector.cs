namespace AgriSmart.Core.Entities
{
    public class CropProductionIrrigationSector : BaseEntity
    {
        public int CropProductionId { get; set; }
        public string? Name { get; set; }
        public string? Polygon { get; set; }
        public bool? Active { get; set; }
    }
}