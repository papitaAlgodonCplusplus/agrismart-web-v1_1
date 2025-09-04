using System.Collections.Generic;

namespace AgriSmart.Tools.Entities
{
    public class CropPhaseEntity: BaseEntity
    {
        public int CatalogId { get; set; }
        public CropEntity Crop { get; set; }
        public string Description { get; set; }
        public int StartingWeek { get; set; }
        public int EndingWeek { get; set; }
        public List<CropPhaseOptimalEntity> CropPhaseOptimals { get; set; }
    }
}
