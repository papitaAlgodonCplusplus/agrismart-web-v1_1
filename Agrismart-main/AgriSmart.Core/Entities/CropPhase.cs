namespace AgriSmart.Core.Entities
{
    public class CropPhase : BaseEntity
    {
        public int CropId { get; set;  }
        public int CatalogId { get; set; }
        public string? Name { get; set; }
        public string? Description { get; set; }
        public int? Sequence { get; set; }
        public int? StartingWeek { get; set; }
        public int? EndingWeek { get; set; }
        public bool? Active { get; set; }
    }
}