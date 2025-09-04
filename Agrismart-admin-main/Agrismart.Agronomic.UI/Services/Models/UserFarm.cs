namespace Agrismart.Agronomic.UI.Services.Models
{
    public record UserFarm
    {
        public int UserId { get; set; }
        public int FarmId { get; set; }
        public bool Active { get; set; }
        public DateTime? DateCreated { get; set; }
        public DateTime? DateUpdated { get; set; }
        public int? CreatedBy { get; set; }
        public int? UpdatedBy { get; set; }
    }
}