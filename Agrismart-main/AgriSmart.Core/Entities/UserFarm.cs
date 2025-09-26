using Microsoft.EntityFrameworkCore;

namespace AgriSmart.Core.Entities
{
    [PrimaryKey(nameof(UserId), nameof(FarmId))]
    public class UserFarm
    {
        public int UserId { get; set; }
        public int FarmId { get; set; }
        public bool? Active { get; set; }
        public DateTime? DateCreated { get; set; }
        public DateTime? DateUpdated { get; set; }
        public int? CreatedBy { get; set; }
        public int? UpdatedBy { get; set; }

        public UserFarm() 
        {
            DateCreated = DateTime.Now;
        }
    }
}
