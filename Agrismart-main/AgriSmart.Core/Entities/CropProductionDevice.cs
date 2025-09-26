using Microsoft.EntityFrameworkCore;

namespace AgriSmart.Core.Entities
{
    [PrimaryKey(nameof(CropProductionId), nameof(DeviceId))]
    public class CropProductionDevice 
    {
        public int CropProductionId { get; set; }
        public int DeviceId { get; set; }
        public DateTime StartDate { get; set; }
        public bool? Active { get; set; }
        public DateTime? DateCreated { get; set; }
        public DateTime? DateUpdated { get; set; }
        public int? CreatedBy { get; set; }
        public int? UpdatedBy { get; set; }

        public CropProductionDevice()
        {
            DateCreated = DateTime.Now;
        }
    }
}