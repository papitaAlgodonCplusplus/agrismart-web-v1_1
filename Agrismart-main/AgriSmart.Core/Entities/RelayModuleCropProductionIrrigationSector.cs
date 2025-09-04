using Microsoft.EntityFrameworkCore;

namespace AgriSmart.Core.Entities
{
    [PrimaryKey(nameof(RelayModuleId), nameof(CropProductionIrrigationSectorId))]
    public class RelayModuleCropProductionIrrigationSector : BaseEntity
    {
        public int RelayModuleId { get; set; }
        public int CropProductionIrrigationSectorId { get; set; }
        public bool Active { get; set; }
        public DateTime? DateCreated { get; set; }
        public DateTime? DateUpdated { get; set; }
        public int? CreatedBy { get; set; }
        public int? UpdatedBy { get; set; }

        public RelayModuleCropProductionIrrigationSector()
        {
            DateCreated = DateTime.Now;
        }
    }
}